// server/index.js

const express = require("express");

const PORT = process.env.PORT || 3001;

const app = express();

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// parse application/json
app.use(express.json());

const escrows = []

app.get("/getEscrows", (req, res) => {
    res.json({ escrows });
})

app.post("/trackSmart", (req, res) => {
  try {
    escrows.push(req.body);
  } catch(error) {
    res.json({ message: error})
  }
})

app.delete("/deleteEscrow", (req, res) => {
  try {
    for(let i = 0; i < escrows.length; i++) {
      if(escrows[i].address == req.body.address) {
        escrows.splice(i, 1);
        console.log(escrows)
      }
    }
  } catch(e) {
    res.json({ message: e })
  }

})

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});