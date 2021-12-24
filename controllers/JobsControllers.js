const Job = require("../model/job");
const fs = require("fs");
const path = require("path");

// newJob function for post job route
const newJob = async (req, res, next) => {
  const {
    companyName,
    title,
    responsibilities,
    location,
    numberOfEmployees,
    languages,
    image,
    dateCreated,
  } = req.body;

  var job = new Job({
    companyName,
    title,
    responsibilities,
    location,
    numberOfEmployees,
    languages,
    image,
    dateCreated,
    owner: req.user.user_id,
  });

  // console.log("help me", await Job.findById(job._id));
  // job.save((err) => {
  //   if (err) return handleError(err);
  // });

  job.save();

  res.json({ message: "POST new job" });
};

const fetchJobs = async (req, res, next) => {
  try {
    const queryResult = await Job.find({});
    res.json({ data: queryResult });
  } catch (err) {
    console.log(err);
  }
};

const editJob = async (req, res, next) => {
  try {
    // format data here
    const {
      _id,
      companyName,
      title,
      responsibilities,
      location,
      numberOfEmployees,
      // languages,
      // image,
    } = req.body;

    const query = { _id };

    await Job.findOneAndUpdate(
      query,
      {
        companyName,
        title,
        responsibilities,
        location,
        numberOfEmployees,
      },
      (err, data) => {
        if (err) {
          res.json({ status: "500", message: "Error in updating job." });
        } else {
          res.json({
            status: "200",
            message: "Successfully updated the job!",
            data,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    // format data here
    const {
      _id,
      companyName,
      title,
      responsibilities,
      location,
      numberOfEmployees,
      // languages,
      // image,
    } = req.body;

    const query = { _id };

    await Job.findOneAndDelete(
      query,
      {
        companyName,
        title,
        responsibilities,
        location,
        numberOfEmployees,
      },
      (err, data) => {
        if (err) {
          res.json({ status: "500", message: "Error in deleting job." });
        } else {
          res.json({
            status: "200",
            message: "Successfully deleted the job!",
            data,
          });
        }
      }
    );
  } catch (err) {
    console.log(err);
  }
};

module.exports = { newJob, fetchJobs, editJob, deleteJob };
