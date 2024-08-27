import express from "express";
import pg from "pg";
import env from "dotenv";

// Constants
const app = express();
const port = process.env.PORT || 10000;
env.config();

const db = new pg.Client({
    // For connection with Local Postgres DB.
    // user: process.env.PG_USER,
    // password: process.env.PG_PASSWORD,
    // host: process.env.PG_HOST,
    // database: process.env.PG_DATABSE,
    // port: process.env.PG_PORT,
    // For cloud DB hosted on render.com and Github code
    connectionString: process.env.DATABASE_URL//_EXT
    ,ssl: {
    rejectUnauthorized: false,
    },
});
db.connect();

// Dummy DB row
let articleList = [
  {
    id: 1,
    title: "Node.js",
    image: "nodejs.png",
    blog: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
  },
];
// Middle Ware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 1. Index
app.get("/", (req, res) => {
  res.render("index.ejs");
});

// 2. Show
app.get("/show", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM articles ORDER BY id");
    articleList = result.rows;
  } catch (err) {
    console.log(err);
  }
  res.render("show.ejs", {
    articles: articleList,
  });
});

// 3. Create
app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.post("/create-submit", async (req, res) => {
  const newArticle = [
    req.body.createTitle,
    req.body.createCover,
    req.body.createBlog,
  ];
  try {
    await db.query(
      "INSERT INTO articles(title, image, blog) VALUES($1, $2, $3)",
      newArticle
    );
  } catch (err) {
    console.log(err);
  }
  res.redirect("/show");
});

// 4. Edit
app.get("/edit", async (req, res) => {
  const title = req.query.title;
  let oldArticle;
  try {
    const result = await db.query(
      "SELECT title, image, blog FROM articles WHERE title=($1)",
      [title]
    );
    oldArticle = result.rows[0];
  } catch (err) {
    console.log(err);
  }
  res.render("edit.ejs", {
    article: oldArticle,
  });
});

app.post("/edit-submit", async (req, res) => {
  const newArticle = [
    req.body.editTitle,
    req.body.editCover || req.body.existingImage,
    req.body.editBlog,
    req.body.title,
  ];
  try {
    await db.query(
      "UPDATE articles SET title=($1), image=($2), blog=($3) WHERE title =($4)",
      newArticle
    );
  } catch (err) {
    console.log(err);
  }
  res.redirect("/show");
});

//5. Delete
app.get("/delete", (req, res) => {
  const title = req.query.title;
  res.render("delete.ejs", {
    title: title,
  });
});

app.post("/delete", async (req, res) => {
  const title = req.body.title;
  try {
    await db.query("DELETE FROM articles WHERE title = ($1)", [title]);
  } catch (err) {
    console.log(err);
  }
  res.redirect("/show");
});

// Server start
app.listen(port, () => {
  console.log(`Server is listening on port ${port}.`);
});
