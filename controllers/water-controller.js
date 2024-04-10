import Water from "../models/Water.js";
import { HttpError } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";
import User from "../models/User.js";

const getAllWater = async (req, res) => {
  const { _id: user } = req.user;
  const { page = 1, limit = 10, ...filterParams } = req.query;
  const skip = (page - 1) * limit;
  const filter = { user, ...filterParams };

  try {
    const [result, total] = await Promise.all([
      Water.find(filter, "-createdAt -updatedAt")
        .populate("user", "name email gender waterRate")
        .skip(skip)
        .limit(limit),
      Water.countDocuments(filter),
    ]);

    res.json({ result, total });
  } catch (error) {
    console.error("Error fetching water records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getWaterById = async (req, res) => {
  const { _id: user } = req.user;
  const { id } = req.params;

  try {
    const result = await Water.findOne({ _id: id, user });
    if (!result) {
      throw HttpError(404, "Water record not found");
    }
    res.json(result);
  } catch (error) {
    console.error("Error fetching water record by ID:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const addWater = async (req, res) => {
  const { _id: user } = req.user;
  const { waterAmount, date, dailyWaterRate } = req.body;

  try {
    const result = await Water.create({
      waterAmount,
      date,
      dailyWaterRate,
      user,
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding water record:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const waterRate = async (req, res) => {
  const { _id } = req.user;
  const { waterRate } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      _id,
      { waterRate },
      { new: true }
    );

    const currentDate = new Date().toISOString().split("T")[0];
    await Water.updateMany(
      { user: _id, date: currentDate },
      { dailyWaterRate: waterRate }
    );

    if (!user) {
      throw HttpError(404, "User not found");
    }

    res.json({ waterRate: user.waterRate });
  } catch (error) {
    console.error("Error updating user water rate:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const deleteWaterById = async (req, res) => {
  const { _id: user } = req.user;
  const { id } = req.params;

  try {
    const result = await Water.findOneAndDelete({ _id: id, user });
    if (!result) {
      throw HttpError(404, `Water record not found`);
    }
    res.json({ message: "Successfully deleted" });
  } catch (error) {
    console.error("Error deleting water record by ID:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const updateWaterById = async (req, res) => {
  const { _id: user } = req.user;
  const { id } = req.params;
  const { waterAmount, date, dailyWaterRate } = req.body;

  try {
    const result = await Water.findOneAndUpdate(
      { _id: id, user },
      { waterAmount, date, dailyWaterRate }
    );
    if (!result) {
      throw HttpError(404, `Water record not found`);
    }
    res.json(result);
  } catch (error) {
    console.error("Error updating water record by ID:", error);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
};

const getWaterByDate = async (req, res) => {
  const { _id: user, waterRate } = req.user;
  const { date = new Date() } = req.query; // Date parameter in format YYYY-MM

  const selectedDate = new Date(date);
  const startDate = new Date(selectedDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(selectedDate);
  endDate.setHours(23, 59, 59, 999);

  const filter = {
    user,
    date: { $gte: startDate, $lte: endDate },
  };

  try {
    const waterRecords = await Water.find(
      filter,
      "date waterAmount dailyWaterRate"
    );

    const totalWaterAmount = waterRecords.reduce(
      (acc, item) => acc + item.waterAmount,
      0
    );

    const totalDailyWaterRate = waterRecords.reduce(
      (acc, item) => acc + item.dailyWaterRate,
      0
    );

    const selectedWaterRecord = waterRecords.find((record) => {
      const recordDate = new Date(record.date);
      return recordDate.toDateString() === selectedDate.toDateString();
    });

    if (!selectedWaterRecord) {
      throw HttpError(404, "Water record not found for the selected date");
    }

    const percentageWaterAmount = Math.round(
      (totalWaterAmount / selectedWaterRecord.dailyWaterRate) * 100
    );

    res.json({
      startDate,
      endDate,
      user: { id: user },
      waterRecords,
      totalWaterAmount,
      percentageWaterAmount,
    });
  } catch (error) {
    console.error("Error fetching water records:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getWaterByMonth = async (req, res) => {
  const { _id: user, waterRate } = req.user;
  const { date = new Date(), start, end } = req.query; // Date parameter in format YYYY-MM

  const startDate = start ? new Date(start) : new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = end ? new Date(end) : new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const filter = {
    user,
    date: { $gte: startDate, $lte: endDate },
  };

  try {
    const waterRecords = await Water.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $dayOfMonth: "$date" },
          sumWaterAmount: { $sum: "$waterAmount" },
          sumDailyWaterRate: { $sum: "$dailyWaterRate" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          dayOfMonth: "$_id",
          sumWaterAmount: 1,
          sumDailyWaterRate: 1,
          count: 1,
        },
      },
    ]);

    const totalData = waterRecords.map((record) => {
      const { dayOfMonth, sumWaterAmount, sumDailyWaterRate, count } = record;

      const selectedWaterRecord = waterRecords.find(
        (record) => record.dayOfMonth === dayOfMonth
      );

      if (!selectedWaterRecord) {
        throw HttpError(404, `Water record not found for day ${dayOfMonth}`);
      }

      const percent = Math.round(
        (sumWaterAmount / selectedWaterRecord.sumDailyWaterRate) * 100
      );
      return {
        date: req.query.date,
        currentYearMonth: date.substring(0, 7),
        reqStart: startDate,
        reqEnd: endDate,
        dayOfMonth,
        waterRate: selectedWaterRecord.sumDailyWaterRate / count, // Calculate the average dailyWaterRate for the day
        percent,
        numberRecords: count,
      };
    });

    res.json(totalData);
  } catch (error) {
    console.error("Error fetching water records by month:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// const getWaterByMonth = async (req, res) => {
//   const currentYearMonth = `${new Date().getFullYear()}-${String(
//     new Date().getMonth() + 1
//   ).padStart(2, "0")}`;

//   console.log("currentYearMonth:", currentYearMonth);

//   const { _id: user, waterRate } = req.user;
//   const { date = currentYearMonth, start, end } = req.query;

//   if (!(date || (start && end))) {
//     throw HttpError(404, `Month or period not specified`);
//   }

//   let startDate;
//   let endDate;

//   if (date) {
//     const [year, month] = date.split("-");
//     startDate = new Date(year, month - 1, 1);
//     endDate = new Date(year, month, 0);
//     endDate.setHours(23, 59, 59, 999);
//   }
//   if (start && end) {
//     const [startYear, startMonth, startDay] = start.split("-");
//     const [endYear, endMonth, endDay] = end.split("-");
//     startDate = new Date(startYear, startMonth - 1, startDay);
//     endDate = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
//   }

//   const filter = {
//     user,
//     date: { $gte: startDate, $lte: endDate },
//   };

//   try {
//     const waterRecords = await Water.aggregate([
//       { $match: filter },
//       {
//         $group: {
//           _id: { $dayOfMonth: "$date" },
//           sumWaterAmount: { $sum: "$waterAmount" },
//           sumDailyWaterRate: { $sum: "$dailyWaterRate" },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $project: {
//           _id: 0,
//           dayOfMonth: "$_id",
//           sumWaterAmount: 1,
//           sumDailyWaterRate: 1,
//           count: 1,
//         },
//       },
//     ]);

//     const totalData = waterRecords.map((record) => {
//       const { dayOfMonth, sumWaterAmount, sumDailyWaterRate, count } = record;

//       const selectedWaterRecord = waterRecords.find(
//         (record) => record.dayOfMonth === dayOfMonth
//       );

//       if (!selectedWaterRecord) {
//         throw HttpError(404, `Water record not found for day ${dayOfMonth}`);
//       }

//       const percent = Math.round(
//         (sumWaterAmount / selectedWaterRecord.sumDailyWaterRate) * 100
//       );
//       return {
//         currentYearMonth,
//         date: req.query.date,
//         reqStart: start,
//         reqEnd: end,
//         realStartDate: startDate,
//         realEndDate: endDate,
//         dayOfMonth,
//         waterRate,
//         percent,
//         numberRecords: count,
//       };
//     });

//     res.json(totalData);
//   } catch (error) {
//     console.error("Error fetching water records by month:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

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
