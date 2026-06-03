// const express = require("express");
import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";
const app: Application = express();
const port = 3000;

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_iIe0yGohD2xj@ep-falling-pine-ap0e9ec4.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      name VARCHAR(20),
      email VARCHAR(20) UNIQUE NOT NULL,
      password VARCHAR(20) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      age INT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);
    console.log("Database connected successfully");
  } catch (error) {
    console.error(error);
  }
};

initDB();

app.get("/", (req: Request, res: Response) => {
  // res.send("Hello World!");
  res.status(200).json({
    name: "Sourav",
    role: "Admin",
  });
});

app.post("/api/users", async (req: Request, res: Response) => {
  // console.log("Body", req.body);

  // const { username, email, password } = req.body;

  // res.status(201).json({
  //   success: true,
  //   data: { username, email },
  // });

  const { name, email, password, age } = req.body;

  try {
    const result = await pool.query(
      `
    INSERT INTO users(name, email, password, age)
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
      [name, email, password, age],
    );
    // console.log(result);

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
});

//getting all users
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT * FROM users
    `);

    res.status(200).json({
      message: "User retrived successfully.",
      success: true,
      data: result.rows,
    });
    // console.log(result.rows);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      success: false,
      error: error,
    });
  }
});

//get single user
app.get("/api/users/:id", async (req: Request, res: Response) => {
  // const id = req.params.id;
  const { id } = req.params;
  // console.log(req.params);

  try {
    const result = await pool.query(
      `
    SELECT * FROM users WHERE id=$1
    `,
      [id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "Users not found",
        success: false,
        error: {},
      });
    } else {
      res.status(200).json({
        message: "User retrived successfully.",
        success: true,
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
      success: false,
      error: error,
    });
  }
});

// update user
app.put("/api/users/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password, age, is_active } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET name=$1,password=$2,age=$3,is_active=$4 WHERE id=$5 RETURNING *
    `,
      [name, password, age, is_active, id],
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        message: "not found",
        success: false,
        error: {},
      });
    } else {
      res.status(200).json({
        message: "Updated successfully",
        success: true,
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    // console.error(error);
    res.status(500).json({
      message: error.message,
      success: false,
      error: error,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
