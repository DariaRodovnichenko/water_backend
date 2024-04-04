import Water from "../models/Water.js";
import { HttpError } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";

const getAllWater = async (req, res) => {
  const { _id: user } = req.user;
  const { page = 1, limit = 10, ...filterParams } = req.query;
  const skip = (page - 1) * limit;
  const filter = { user, ...filterParams };

  const [result, total] = await Promise.all([
    Water.find(filter, "-createdAt -updatedAt")
      .populate("user", "name email gender waterRate")
      .skip(skip)
      .limit(limit),
    Water.countDocuments(filter),
  ]);

  res.json({ result, total });
};

const getWaterById = async (req, res) => {
  const { _id: user } = req.user;
  const { id } = req.params;
  const result = await Water.findOne({ _id: id, user });
  if (!result) {
    throw HttpError(404, "Water record not found");
  }
  res.json(result);
};

const addWater = async (req, res) => {
  const { _id: user } = req.user;
  const result = await Water.create({ ...req.body, user });
  res.status(201).json(result);
};

const waterRate = async (req, res) => {
  const { _id } = req.user;
  const user = await User.findOneAndUpdate(_id, req.body);
  if (!user) {
    throw HttpError(404, `Not found`);
  }

  res.json({
    waterRate: user.waterRate,
  });
};

const deleteWaterById = async (req, res) => {
  const { _id: user } = req.user;
  const { id } = req.params;
  const result = await Water.findOneAndDelete({ _id: id, user });
  if (!result) {
    throw HttpError(404, `Water record not found`);
  }
  res.json({ message: "Delete successful" });
};

const updateWaterById = async (req, res) => {
  const { _id: user } = req.user;
  const { id } = req.params;
  const result = await Water.findOneAndUpdate({ _id: id, user }, req.body);
  if (!result) {
    throw HttpError(404, `Water record not found`);
  }
  res.json(result);
};

const getWaterByDate = async (req, res) => {
  const { _id: user, waterRate } = req.user;

  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );
  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    23,
    59,
    59,
    999
  );

  const filter = {
    user,
    date: { $gte: startDate, $lte: endDate },
  };

  const waterRecords = await Water.find(filter, "date waterAmount");
  const allWaterAmount = waterRecords.reduce(
    (acc, item) => acc + item.waterAmount,
    0
  );
  const percentageWaterAmount = Math.round((allWaterAmount / waterRate) * 100);

  res.json({ user: { id: user }, waterRecords, percentageWaterAmount });
};
const getWaterByMonth = async (req, res) => {
  const { _id: user, waterRate } = req.user;
  const { date } = req.query;
  const [year, month] = date.split("-");

  const startDate = new Date(year, month - 2, 1);
  const endDate = new Date(year, month, -1, 0, 23, 59, 59, 999);

  const filter = {
    user,
    date: { $gte: startDate, $lte: endDate },
  };

  const waterRecords = await Water.aggregate([
    { $match: filter },
    {
      $group: {
        _id: { $dayOfMonth: "$date" },
        sumWaterAmount: { $sum: "$waterAmount" },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        dayOfMonth: "$_id",
        sumWaterAmount: 1,
        count: 1,
      },
    },
  ]);

  const totalData = waterRecords.map((record) => {
    const { dayOfMonth, sumWaterAmount, count } = record;
    const percent = Math.round((sumWaterAmount / waterRate) * 100);
    return {
      dayOfMonth,
      waterRate,
      percent,
      numberRecords: count,
    };
  });

  res.json(totalData);
};

export default {
  getAllWater: ctrlWrapper(getAllWater),
  getWaterById: ctrlWrapper(getWaterById),
  waterRate: ctrlWrapper(waterRate),
  addWater: ctrlWrapper(addWater),
  deleteWaterById: ctrlWrapper(deleteWaterById),
  updateWaterById: ctrlWrapper(updateWaterById),
  getWaterByDate: ctrlWrapper(getWaterByDate),
  getWaterByMonth: ctrlWrapper(getWaterByMonth),
};
