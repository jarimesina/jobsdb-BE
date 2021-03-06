const Job = require("../model/job");
const User = require("../model/user");
const moment = require("moment");
const UserDetail = require("../model/userDetails");
const { sendEmail } = require("../services/sendgrid-service");

const fetchCreatedJobs = async (req, res, next) => {
  try {
    const id = req.query.id;

    const queryResult = await Job.find({ owner: id });

    res.json({ data: queryResult });
  } catch (err) {
    console.log(err);
  }
};

// newJob function for post job route
const newJob = async (req, res, next) => {
  const { title, responsibilities, requirements, location, languages, image } =
    req.body;

  var job = new Job({
    title,
    responsibilities,
    requirements,
    location,
    languages,
    image,
    owner: req.user.user_id,
  });

  // job.save((err) => {
  //   if (err) return handleError(err);
  // });

  job.save();

  res.json({ message: "POST new job" });
};

const fetchJobs = async (req, res, next) => {
  try {
    let query = {};

    const { skip, limit, programmingLanguage, dateRange } = req.query;
    if (programmingLanguage) {
      query.languages = programmingLanguage;
    }

    if (dateRange) {
      if (dateRange === "today") {
        const today = new Date();
        const date =
          today.getFullYear() +
          "-" +
          (today.getMonth() + 1) +
          "-" +
          today.getDate();

        query.dateCreated = { $gte: date };
      } else if (dateRange === "pastWeek") {
        const startOfWeek = moment().clone().startOf("week");
        const endOfWeek = moment().clone().endOf("week");

        query.dateCreated = {
          $gte: new Date(startOfWeek.toLocaleString()),
          $lte: new Date(endOfWeek.toLocaleString()),
        };
      } else if (dateRange === "pastMonth") {
        const startOfMonth = moment().clone().startOf("month");
        const endOfMonth = moment().clone().endOf("month");

        query.dateCreated = {
          $gte: new Date(startOfMonth.toLocaleString()),
          $lte: new Date(endOfMonth.toLocaleString()),
        };
      }
    }

    const queryResult = await Job.find(query)
      .populate({
        path: "owner",
        populate: {
          path: "info",
          model: "companyDetail",
        },
      })
      .skip(skip ? parseInt(skip) : 0)
      .limit(limit ? parseInt(limit) : 10);
    const total = await Job.find(query).count();
    res.json({ data: { jobs: queryResult, total: total } });
  } catch (err) {
    console.log(err);
  }
};

const editJob = async (req, res, next) => {
  try {
    // format data here
    const {
      _id,
      // companyName,
      title,
      responsibilities,
      location,
      // numberOfEmployees,
      // languages,
      // image,
    } = req.body;

    const query = { _id };

    await Job.findOneAndUpdate(
      query,
      {
        // companyName,
        title,
        responsibilities,
        location,
        // numberOfEmployees,
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
    const { id } = req.body;

    const query = { _id: id };

    await Job.findOneAndDelete(query, (err, data) => {
      if (err) {
        res.json({ status: "500", message: "Error in deleting job." });
      } else {
        res.json({
          status: "200",
          message: "Successfully deleted the job!",
          data,
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

const addToSavedJobs = async (req, res, next) => {
  try {
    const { jobId, userId } = req.query;
    const user = await User.findById({ _id: userId }).populate({
      path: "info",
      model: "userDetail",
    });

    if (!user.info?.saved_jobs.includes(jobId)) {
      const temp = await UserDetail.findByIdAndUpdate(
        { _id: user?.info._id },
        { $push: { saved_jobs: jobId } },
        { upsert: true, returnDocument: "after" }
      ).populate({
        path: "saved_jobs",
        model: "job",
        populate: {
          path: "owner",
          model: "user",
          populate: {
            path: "info",
            model: "companyDetail",
          },
        },
      });

      res.json({
        status: "200",
        message: "Successfully saved job!",
        data: temp.saved_jobs,
      });
    }

    res.json({ status: "400", message: "Error in saving job." });
  } catch (err) {
    console.log(err);
  }
};

const removeSavedJob = async (req, res, next) => {
  try {
    const { jobId, userId } = req.query;
    const user = await User.findById({ _id: userId }).populate({
      path: "info",
      model: "userDetail",
    });

    if (user.info.saved_jobs.includes(jobId)) {
      const temp = await UserDetail.findById({ _id: user.info._id }).populate({
        path: "saved_jobs",
        model: "job",
        populate: {
          path: "owner",
          model: "user",
          populate: {
            path: "info",
            model: "companyDetail",
          },
        },
      });

      temp.saved_jobs.pull({ _id: jobId });
      await temp.save();

      res.json({
        status: "200",
        message: "Successfully removed saved job!",
        data: temp.saved_jobs,
      });
    }

    res.json({ status: "400", message: "Error in saving job." });
  } catch (err) {
    console.log(err);
  }
};

const applyJob = async (req, res, next) => {
  const { toEmail, jobId, userId } = req.body;

  console.log("toEmail, jobId, userId", toEmail, jobId, userId);
  try {
    // add to set only adds item to field if it does not exist
    const temp = await Job.findByIdAndUpdate(
      { _id: jobId },
      { $addToSet: { applicants: userId } },
      { upsert: true, returnDocument: "after" }
    );

    await sendEmail(toEmail || "jarimesina1234@gmail.com");

    res.json({
      status: 200,
      data: temp,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  newJob,
  fetchCreatedJobs,
  fetchJobs,
  editJob,
  deleteJob,
  addToSavedJobs,
  removeSavedJob,
  applyJob,
};
