import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Build match conditions
  const matchConditions = {};

  // Add text search if query is provided
  if (query) {
    matchConditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // Filter by userId if provided
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    matchConditions.owner = new mongoose.Types.ObjectId(userId);
  }

  // Filter only published videos
  matchConditions.isPublished = true;

  // Build sort object
  const sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  } else {
    sortOptions.createdAt = -1; // Default sort by newest
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Aggregate pipeline
  const videos = await Video.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { fullName: 1, username: 1, avatar: 1 } }],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  // Get total count for pagination metadata
  const totalVideos = await Video.countDocuments(matchConditions);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalVideos / parseInt(limit)),
          totalVideos,
          limit: parseInt(limit),
        },
      },
      "Videos fetched successfully!"
    )
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  // Validate required fields
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFile = req.files?.videoFile?.[0];
  // console.log("Uploaded video file:", videoFile);
  if (!videoFile) {
    throw new ApiError(400, "Video file is required");
  }

  const thumbnailFile = req.files?.thumbnail?.[0];
  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail image is required");
  }

  // Declare variables outside try block
  let videoUploadResult;
  let thumbnailUploadResult;

  try {
    videoUploadResult = await uploadOnCloudinary(videoFile.path, "videos");
    thumbnailUploadResult = await uploadOnCloudinary(
      thumbnailFile.path,
      "thumbnails"
    );

    if (!videoUploadResult || !thumbnailUploadResult) {
      throw new ApiError(500, "Failed to upload video or thumbnail");
    }
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to upload video or thumbnail"
    );
  }

  const newVideo = await Video.create({
    videoFile: videoUploadResult.secure_url,
    thumbnail: thumbnailUploadResult.secure_url,
    title,
    description,
    duration: videoUploadResult.duration,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  // Increment views
  await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (!title && !description && !req.file) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateFields = {};

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  // If thumbnail is uploaded
  if (req.file) {
    const thumbnailUploadResult = await uploadOnCloudinary(
      req.file.path,
      "thumbnails"
    );

    if (!thumbnailUploadResult) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }

    updateFields.thumbnail = thumbnailUploadResult.secure_url;
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user is the owner of the video
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to change this video's publish status"
    );
  }

  video.isPublished = !video.isPublished;
  await video.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        video,
        `Video ${video.isPublished ? "published" : "unpublished"} successfully!`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
