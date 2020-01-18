const jsonfile = require("jsonfile");
const file = "data.json";
const express = require("express");
const app = express();
const methodOverride = require("method-override");
const reactEngine = require("express-react-views").createEngine();

app.use(express.static(__dirname + "/public/"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.use(methodOverride("_method"));

app.engine("jsx", reactEngine);

app.set("views", __dirname + "/views");
app.set("view engine", "jsx");

app.get("/", (req, res) => {
  jsonfile.readFile(file, (err, obj) => {
    res.render("home", obj);
  });
});

app.get("/recipes/new", (req, res) => {
  res.render("new");
});

app.post("/recipes/", (req, res) => {
  const recipe = req.body;
  jsonfile.readFile(file, (err, obj) => {
    recipe.id = obj.recipes.length;
    obj.recipes.push(recipe);
    jsonfile.writeFile(file, obj, err => {});
  });
  res.redirect("/");
});

app.get("/recipes/search/", (req, res) => {
  const search = req.query.search.toLowerCase();
  let found;
  let index;
  const searchArray = [];

  jsonfile.readFile(file, (err, obj) => {
    const data = {
      search: search
    };
    for (let i = 0; i < obj.recipes.length; i++) {
      if (obj.recipes[i].title.toLowerCase().includes(search)) {
        found = true;
        index = i;
        searchArray.push(obj.recipes[i]);
      }
      console.log("helllllllooo", searchArray);
    }
    if (found) {
      const searchObject = {
        recipes: searchArray,
        searchString: `You searched for "${search}"! Searches matching "${search}":`
      };
      console.log("search object is", searchObject);
      res.render("home", searchObject);
    } else {
      res.render("404", data);
    }
  });
});

app.get("/recipes/:id", (req, res) => {
  const index = req.params.id;
  let recipe;
  jsonfile.readFile(file, (err, obj) => {
    recipe = obj.recipes[index];
    res.render("recipe", recipe);
  });
});

app.get("/recipes/:id/edit", (req, res) => {
  const index = req.params.id;
  let recipe;
  jsonfile.readFile(file, (err, obj) => {
    recipe = obj.recipes[index];
    res.render("edit", recipe);
  });
});

app.put("/recipes/:id", (req, res) => {
  const index = req.params.id;
  jsonfile.readFile(file, (err, obj) => {
    Object.assign(obj.recipes[index], req.body);
    jsonfile.writeFile(file, obj, err => {
      res.redirect("/");
    });
  });
});

app.get("/recipes/:id/delete", (req, res) => {
  const index = req.params.id;
  jsonfile.readFile(file, (err, obj) => {
    res.render("delete", obj.recipes[index]);
  });
});

app.delete("/recipes/:id", (req, res) => {
  const index = req.params.id;
  jsonfile.readFile(file, (err, obj) => {
    obj.recipes.splice(index, 1);
    for (let i = 0; i < obj.recipes.length; i++) {
      obj.recipes[i].id = i;
    }
    jsonfile.writeFile(file, obj, err => {
      res.redirect("/");
    });
  });
});

app.get("/recipes/sort/:type", (req, res) => {
  const type = req.params.type;
  jsonfile.readFile(file, (err, obj) => {
    obj.recipes.sort((a, b) => {
      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    });
    res.render("home", obj);
  });
  // redirect to home with type sorted
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});