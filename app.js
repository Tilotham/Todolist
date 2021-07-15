//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const app = express();
const _ = require('lodash');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-tilotham:4test@cluster0.lx88j.mongodb.net/todoListDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

listItems = [];

const itemsSchema = {
  name: String
};

const listsSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("Item",itemsSchema);

const List = mongoose.model("List",listsSchema);

const item1 = new Item ({
  name: "Welcome to to-do list"
})

const item2 = new Item ({
  name: "Use + sign to add to-do's"
})

const item3 = new Item ({
  name: "<-- click here to cross it"
})

const defaultItems = [item1,item2,item3];

app.post("/", function(req, res){
  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/checked", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId,function(err) {
      if(err){
        console.log(err);
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err) {
      if (!err) {
        res.redirect("/"+listName);
      }
    });
  }


});

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err) {
        if (err) {
          console.log(err);
        }else {
          console.log("Success");
        }
      })
      res.redirect("/")
    }
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })

});

app.get("/:list", function(req,res){
  const listName = _.capitalize(req.params.list);
  List.findOne({name: listName},function(err, foundList) {
    if (!foundList) {
      const list = new List({
        name: listName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+listName)
    }else{
      res.render("list", {listTitle: listName, newListItems: foundList.items});
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
