const express = require("express");
const app = express();

const AWS = require("aws-sdk");
AWS.config.loadFromPath("./config/config.json");

const docClient = new AWS.DynamoDB.DocumentClient();

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("./views"));

app.set("view engine", "ejs");
app.set("views", "./views");

const tableName = "SanPham";

app.get("/", (req, res) => {
  const params = {
    TableName: tableName,
  }

  docClient.scan(params, (err, data) => {
    if (err) {
      res.send("internal server error");
    } else {
      res.render("index", { sanPhams: data.Items });
    }
  });
});

app.post("/delete", (req, res) => {
  const list_item = Object.keys(req.body).map(item => item);
  
  if (list_item.length === 0) {
    res.redirect("/");
    return;
  }
  function onDeleteItems(index) {
    const params = {
      TableName: tableName,
      Key: {
        "ma_sp": list_item[index]
      }
    }

    docClient.delete(params, (err, data) => {
      if (err) {
        console.log('err = ', err);
        res.send("internal server error");
      } else {
        if (index > 0) {
          onDeleteItems(index - 1);
        } else {
          res.redirect("/");
        }
      }
    });
  }

  onDeleteItems(list_item.length - 1);
});

app.listen(3000, () => {
  console.log('App is listening on port 3000');
});
