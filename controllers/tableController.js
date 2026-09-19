import Table from "../models/Table.js";

export const getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({
      tableNumber: 1,
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch tables",
      error: error.message,
    });
  }
};

export const createTable = async (req, res) => {
  try {
    const { tableNumber } = req.body;

    if (!tableNumber) {
      return res.status(400).json({
        message: "Table number is required",
      });
    }

    const existingTable = await Table.findOne({
      tableNumber,
    });

    if (existingTable) {
      return res.status(400).json({
        message: "Table already exists",
      });
    }

    const table = await Table.create({
      tableNumber,
    });

    res.status(201).json({
      message: "Table created successfully",
      table,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create table",
      error: error.message,
    });
  }
};