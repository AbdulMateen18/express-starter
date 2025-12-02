import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  // Get total subscribers
  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  // Get total videos and total views using aggregation
  const videoStats = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalVideos: { $sum: 1 },
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  // Get total likes on all videos of the channel
  const likesStats = await Like.aggregate([
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
      },
    },
    {
      $unwind: "$videoDetails",
    },
    {
      $match: {
        "videoDetails.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
      },
    },
  ]);

  const stats = {
    totalSubscribers,
    totalVideos: videoStats[0]?.totalVideos || 0,
    totalViews: videoStats[0]?.totalViews || 0,
    totalLikes: likesStats[0]?.totalLikes || 0,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelId = req.user._id;
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortType = "desc",
  } = req.query;

  // Build sort object
  const sortOptions = {};
  sortOptions[sortBy] = sortType === "desc" ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get all videos uploaded by the channel
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    {
      $project: {
        likes: 0, // Remove likes array from response
      },
    },
    { $sort: sortOptions },
    { $skip: skip },
    { $limit: parseInt(limit) },
  ]);

  // Get total count for pagination
  const totalVideos = await Video.countDocuments({ owner: channelId });

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
      "Channel videos fetched successfully"
    )
  );
});

export { getChannelStats, getChannelVideos };
