import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  FormControl,
  MenuItem,
  Select,
  ListSubheader,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
// import { Close } from "@material-ui/icons";
import { MuiPickersUtilsProvider, DatePicker, KeyboardDatePicker } from "@material-ui/pickers";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import _ from "lodash";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import DateTimePatientCards from "../utils/components/toolbar/DateTimePatientCards";
import { RepositoryFactory } from "../../api/repositories/RepositoryFactory";

const PatientRepository = RepositoryFactory.get("patient");
const StatuscodesRepository = RepositoryFactory.get("statuscodes");

const MySwal = withReactContent(Swal);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  table: {
    minWidth: 650,
  },
  card: {
    maxWidth: 340,
  },
  row: {
    margin: "15px 0px",
  },
  invisible: {
    visibility: "hidden",
  },
  hide: {
    display: "none",
  },
  title: {
    fontSize: 14,
  },
  empty: {
    border: "dashed 1px white",
  },
  occupied: {
    border: "solid 1px white",
  },
  cardContent: {
    paddingBottom: "10px !important",
    padding: "0px",
  },
  whiteText: {
    color: "#ffffff",
  },
  gridInputMargin: {
    marginLeft: "15px",
  },
  formControl: {
    width: "100%",
    paddingRight: "1em"
  },
  smallFormControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const PatientRegister = (props) => {
  const classes = useStyles();
  const { match, history } = props;
  const { register, handleSubmit, watch, errors, control, setValue, getValues } = useForm();
  const [patient, setPatient] = useState({
    date_admitted: "",
    lastname: "",
    firstname: "",
    birthdate: null,
    age: "",
    gender: "",
    covid19_case: "",
    admission: "",
    remarks: "",
    address: "",
    city: "",
    country: "",
    contact_number: "",
    email_address: "",
    sss_gsis_number: "",
    philhealth_number: "",
    hmo: "",
    emergency_name: "",
    emergency_relationship: "",
    emergency_contact_number: "",
  });
  const [patientStatus, setPatientStatus] = useState([]);

  useEffect(() => {
    getPatient();
    getStatuscodes();
  }, []);

  const getStatuscodes = async () => {
    const { data: covidStatus } = await StatuscodesRepository.getPatientClassification();
    const { data: classificationStatus } = await StatuscodesRepository.getPatientCovidCase();
    const { data: admission } = await StatuscodesRepository.getPatientAdmissionStatus();
    setPatientStatus([
      ...covidStatus.filter_statuscode_report,
      ...classificationStatus.filter_statuscode_report,
      ...admission.filter_statuscode_report,
    ]);
  };

  const patientHandler = (e, modifiedVal = null) => {
    const data = { ...patient };
    if (e) {

      if (e.target.name == "patient_classification" && e.target.value == 28) {
        data["covid19_case"] = 29;
        setValue("covid19_case", 29);
      }

      if (e.target.name == "covid19_case" &&  data["patient_classification"] == 28) {
        return ()=>{
          data["covid19_case"] = 29;
          setValue("covid19_case", 29);
        }
      }

      data[e.target.name] = e.target.value;
      setValue(e.target.name, e.target.value);
    } else {
      const { key, value } = modifiedVal;
      switch (key) {
        case "birthdate":
          data[key] = value ? moment(value).format("YYYY-MM-DD HH:mm:ss") : null;
          setValue(key, moment(value).format("YYYY-MM-DD HH:mm:ss"));

          let diffInYears = moment().diff(moment(value), "years");
          if (diffInYears === 0) {
            diffInYears = moment().diff(moment(value), "years", true).toFixed(3);
          }
          data.age = diffInYears || "";
          setValue("age", diffInYears);
          break;
        default:
          break;
      }
    }
    setPatient(data);
  };

  const getPatient = async () => {
    if (!_.isEmpty(match.params)) {
      const res = await PatientRepository.getPatient(match.params.id);
      if (!_.isEmpty(res.data.PatientData_report)) {
        const patient = res.data.PatientData_report[0];
        await parsePatientData(patient);
        console.log(patient);
      } else {
        alert("no patient data");
      }
    }
  };

  const parsePatientData = (data) => {
    /* new fields from update
      id
      middlename
      patientstatus
      ward_id
    */
    const updatedData = { ...patient };
    updatedData.address = data.rpi_address;
    updatedData.age = data.rpi_age;
    updatedData.birthdate = data.rpi_birthday;
    updatedData.city = data.rpi_city;
    updatedData.contact_number = data.rpi_contact;
    updatedData.emergency_name = data.rpi_contact_name;
    updatedData.emergency_contact_number = data.rpi_contact_number;
    updatedData.emergency_relationship = data.rpi_contact_relationship;
    updatedData.country = data.rpi_country;
    updatedData.covid19_case = data.rps_case;
    updatedData.date_admitted = data.rpi_date_admitted;
    updatedData.date_admitted = data.rpi_dateregistered;
    updatedData.email = data.rpi_email_add;
    updatedData.gender = data.rpi_gender;
    updatedData.hmo = data.rpi_hmo;
    updatedData.patientid = data.rpi_patientid;
    updatedData.firstname = data.rpi_patientfname;
    updatedData.lastname = data.rpi_patientlname;
    updatedData.middlename = data.rpi_patientmname;
    updatedData.admission = data.rps_admission;
    updatedData.philhealth_number = data.rpi_philhealth_number;
    updatedData.remarks = data.rpi_remarks;
    updatedData.sss_gsis_number = data.rpi_sss_gsis_number;
    updatedData.ward_id = data.rpi_ward_id;
    updatedData.bed_number = data.rpi_bednumber;
    updatedData.civil_status = data.rpi_civilstatus;
    updatedData.patient_classification = data.rps_class;
    setPatient(updatedData);
    console.log(updatedData);
    for (let [key, value] of Object.entries(updatedData)) {
      setValue(key, value);
    }
  };

  const validateInputs = (data) => {
    console.log('formdata', data);
    const response = {
      patientfname: data.firstname,
      patientlname: data.lastname,
      remarks: data.remarks,
      birthday: data.birthdate,
      gender: data.gender,
      age: data.age,
      covidcase: data.covid19_case,
      admissionstatus: data.admission,
      address: data.address,
      city: data.city,
      country: data.country,
      contact: data.contact_number,
      email: data.email,
      sss_gsis: data.sss_gsis_number,
      philhealth: data.philhealth_number,
      hmo: data.hmo,
      admissiondate: moment().format("YYYY-MM-DD HH:mm:ss"),
      emcontactname: data.emergency_name,
      emcontactnumber: data.emergency_contact_number,
      emrelationship: data.emergency_relationship,
      ward: data.ward_id || 0,
      patientid: data.patientid,
      patientmname: data.middlename || "",
      patientstatus: data.patientstatus || "",
      civil_status: data.civil_status,
      bed_no: data.bed_number,
      classification: data.patient_classification,
    };
    return response;
  };

  const onSubmit = async (data) => {
    const { patientid } = data;
    console.log(data);
    const payload = validateInputs({ ...data });
    const formData = new FormData();

    for (let [key, value] of Object.entries(payload)) {
      if (typeof value === "undefined") {
        value = "";
      }
      if (typeof value === "string") {
        value = value.trim();
      }
      formData.append(key, value);
    }
    
    console.log(data);

    Swal.fire({
      icon: "question",
      title: "Is all infomation correct?",
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "Yes",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise(async (resolve, _reject) => {
          if (patientid) {
            console.log("update");
            await PatientRepository.updatePatient(formData)
              .then((res) => {
                if (res.data.updatepatient_report) {
                  return resolve([patientid]);
                }
              })
              .catch((err) => {
                resolve(["error", err]);
              });
          } else {
            await PatientRepository.createPatient(formData)
              .then(async (res) => {
                console.log(res);
                if (res.data.addpatient_report) {
                  const patient_id = res.data.addpatient_report[0].patient_id;
                  await PatientRepository.createDefaultPatientConfig(
                    patient_id
                  );
                  resolve([patient_id]);
                }
              })
              .catch((err) => {
                resolve(["error", err]);
              });
          }
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then(async (result) => {

      if (result.dismiss) {
        return;
      }

      if (result.value[0] == "error") {
        console.error(result.value[1]);
        return Swal.fire({
          icon: "error",
          title: "Operation Error: Please try again.",
          showConfirmButton: true
        });
      } else {
        return Swal.fire({
          icon: "success",
          title: "Patient " + (patientid ? "updated" : "added"),
          showConfirmButton: true,
          onClose: () => history.push({ pathname: `/patient/details/${result.value[0]}`, state: "" }),
        });
      }
    })
  };

  useEffect(() => {
    register({ name: "covid19_case" }, { required: true }); // custom register react-select
    register({ name: "patient_classification" }, { required: true }); // custom register react-select
    register({ name: "admission" }, { required: true }); // custom register react-select
    register({ name: "civil_status" }, { required: true }); // custom register react-select
    register({ name: "gender" }, { required: true }); // custom register antd input
    register({ name: "patientid" }); // custom register antd input
    register({ name: "middlename" }); // custom register antd input
    register({ name: "patientstatus" }); // custom register antd input
    register({ name: "ward_id" }); // custom register antd input
  }, [register]);

  return (
    <>
      <DateTimePatientCards className={classes.row} />
      <Typography align="left" variant="h4">
        {/* Register Patient */}
        {!_.isEmpty(match.params) ? "Update " : "Register "}
        Patient
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {console.log(errors)}
        <Grid container>
          <Grid item xs={0} lg={1} />
          <Grid item align="" xs={12} lg={10}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" align="left" color="textSecondary" gutterBottom>
                  Personal Information
                </Typography>
                <Divider light style={{ marginBottom: "15px" }} />
                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Last Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      error={errors.lastname}
                      margin="dense"
                      variant="outlined"
                      name="lastname"
                      // value={patient.lastname}
                      // onChange={patientHandler}
                      inputRef={register(
                        // { required: true },
                        {
                          validate: {
                            InvalidInput: (value) => {
                              if (!value.replace(/\s/g, "").length) {
                                return "Input is empty or has only spaces";
                              }
                            },
                          },
                        }
                      )}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Date of Birth:
                    </Typography>
                  </Grid>
                  <Grid item xs={2} align="left">
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      {/* <DatePicker
                        margin="dense"
                        error={errors.birthdate}
                        inputVariant="outlined"
                        format="MM/DD/YYYY"
                        clearable
                        disableFuture
                        name="birthdate"
                        value={patient.birthdate}
                        onChange={(date) => {
                          patientHandler(null, { key: "birthdate", value: date });
                          // setBirthdate(date.format("YYYY-MM-DD"));
                        }}
                        inputRef={register({ required: true })}
                      /> */}
                      <KeyboardDatePicker
                        margin="dense"
                        error={errors.birthdate}
                        inputVariant="outlined"
                        disableFuture
                        clearable
                        // value={selectedDate}
                        // placeholder="10/10/2018"
                        name="birthdate"
                        value={patient.birthdate}
                        onChange={(date) => {
                          patientHandler(null, { key: "birthdate", value: date });
                          // setBirthdate(date.format("YYYY-MM-DD"));
                        }}
                        inputRef={register({ required: true })}
                        format="MM/DD/YYYY"
                      // minDate={new Date()}
                      // format="MM/dd/yyyy"
                      />
                    </MuiPickersUtilsProvider>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Age:
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField className={classes.formControl}
                      margin="dense"
                      variant="outlined"
                      name="age"
                      value={patient.age}
                      // onChange={patientHandler}
                      disabled
                      inputRef={register({ required: true })}
                    />
                  </Grid>
                </Grid>

                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      First Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      error={errors.firstname}
                      margin="dense"
                      variant="outlined"
                      name="firstname"
                      // value={patient.firstname}
                      // onChange={patientHandler}
                      inputRef={register(
                        // { required: true },
                        {
                          validate: {
                            InvalidInput: (value) => {
                              if (!value.replace(/\s/g, "").length) {
                                return "Input is empty or has only spaces";
                              }
                            },
                          },
                        }
                      )}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Civil Status:
                    </Typography>
                  </Grid>
                  <Grid item xs={2} align="left">
                    <FormControl margin="dense" variant="outlined" className={classes.formControl}>
                      <Select
                        error={errors.civil_status}
                        id="civilstatus-select"
                        labelId="civil-status"
                        value={patient.civil_status || ""}
                        onChange={patientHandler}
                        name="civil_status"
                      // inputRef={register({ required: true })}
                      >
                        <MenuItem value={"Single"}>Single</MenuItem>
                        <MenuItem value={"Married"}>Married</MenuItem>
                        <MenuItem value={"Widowed"}>Widowed</MenuItem>
                        <MenuItem value={"Others"}>Others</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Gender:
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <FormControl
                      margin="dense"
                      className={classes.formControl}
                      variant="outlined"
                    >
                      <Select
                        error={errors.gender}
                        id="gender-select"
                        labelId="gender"
                        onChange={patientHandler}
                        value={patient.gender || ""}
                        name="gender"
                        // inputRef={register({ required: true })}
                        autoWidth
                      >
                        <MenuItem value={"Male"}>Male</MenuItem>
                        <MenuItem value={"Female"}>Female</MenuItem>
                      </Select>
                    </FormControl>
                    {/* <FormControl className={classes.smallFormControl} variant="outlined">
                      <Select
                        labelId="demo-simple-select-autowidth-label"
                        id="demo-simple-select-autowidth"
                        value={patient.civil_status || ""}
                        onChange={patientHandler}
                        autoWidth
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem value={10}>Ten</MenuItem>
                        <MenuItem value={20}>Twenty</MenuItem>
                        <MenuItem value={30}>Thirtyyyyyy</MenuItem>
                      </Select>
                    </FormControl> */}
                  </Grid>
                  {/* <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Civil Status:
                    </Typography>
                  </Grid>
                  <Grid item xs={1} align="left">
                    <FormControl margin="dense" variant="outlined" className={classes.formControl}>

                      <Select
                        id="grouped-select"
                        labelId="gender"
                        onChange={patientHandler}
                        value={patient.gender || ""}
                        name="gender"
                        // inputRef={register({ required: true })}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
                  {/* <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Gender:
                    </Typography>
                  </Grid>
                  <Grid item xs={1} align="left">
                    <FormControl margin="dense" variant="outlined" className={classes.formControl}>

                      <Select
                        id="grouped-select"
                        labelId="gender"
                        onChange={patientHandler}
                        value={patient.gender || ""}
                        name="gender"
                        // inputRef={register({ required: true })}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid> */}
                </Grid>
                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      COVID-19 Diagnosis:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <FormControl margin="dense" variant="outlined" className={classes.formControl}>
                      <Select
                        error={errors.patient_classification}
                        id="case-select"
                        labelId="patient-classification"
                        value={patient.patient_classification || ""}
                        onChange={patientHandler}
                        name="patient_classification"
                      // inputRef={register({ required: true })}
                      >
                        {/* <ListSubheader>Classification</ListSubheader> */}
                        {patientStatus.map((el) => {
                          if (el.rps_category === "Classification") {
                            return <MenuItem value={el.rps_id}>{el.rps_name}</MenuItem>;
                          }
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Note/s:
                    </Typography>
                  </Grid>
                  <Grid item xs={5} align="left">
                    <TextField className={classes.formControl}
                      margin="dense"
                      variant="outlined"
                      rows={3}
                      multiline
                      name="remarks"
                      // value={patient.remarks}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      COVID-19 Case:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <FormControl margin="dense" variant="outlined" className={classes.formControl}>
                      <Select
                        error={errors.covid19_case}
                        id="case-select"
                        labelId="covid-case"
                        value={patient.covid19_case || ""}
                        onChange={patientHandler}
                        name="covid19_case"
                      // inputRef={register({ required: true })}
                      >
                        {/* <ListSubheader>Confirmed Covid-19 Case</ListSubheader> */}
                        {patientStatus.map((el) => {
                          if (el.rps_category === "Covid Case") {
                            return <MenuItem value={el.rps_id}>{el.rps_name}</MenuItem>;
                          }
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Admission Status:
                    </Typography>
                  </Grid>
                  <Grid item xs={2} align="left">
                    <FormControl margin="dense" variant="outlined" className={classes.formControl}>
                      <Select
                        error={errors.admission}
                        id="admission-select"
                        labelId="admission"
                        value={patient.admission || ""}
                        onChange={patientHandler}
                        name="admission"
                      // inputRef={register({ required: true })}
                      >
                        {/* <ListSubheader>Confirmed Covid-19 Case</ListSubheader> */}
                        {patientStatus.map((el) => {
                          if (el.rps_category === "Admission Status") {
                            return <MenuItem value={el.rps_id}>{el.rps_name}</MenuItem>;
                          }
                        })}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={1}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Bed No.:
                    </Typography>
                  </Grid>
                  <Grid item xs={2} align="left">
                    <TextField className={classes.formControl}
                      error={errors.bed_number}
                      margin="dense"
                      variant="outlined"
                      name="bed_number"
                      // value={patient.remarks}
                      // onChange={patientHandler}
                      inputRef={register({
                        validate: {
                          positive: (value) => parseInt(value, 10) > 0,
                          InvalidInput: (value) => {
                            if (!value.replace(/\s/g, "").length) {
                              return "Input is empty or has only spaces";
                            }
                          },
                        },
                      })}

                    // inputRef={register({ min: 1 })}
                    />
                  </Grid>
                </Grid>
                <Typography
                  variant="h5"
                  align="left"
                  color="textSecondary"
                  gutterBottom
                  className={classes.row}
                >
                  Contact Information
                </Typography>
                <Divider light style={{ marginBottom: "15px" }} />
                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Address:
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      multiline
                      name="address"
                      // value={patient.address}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      City:
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      multiline
                      name="city"
                      // value={patient.city}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Country/State:
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      margin="dense"
                      variant="outlined"
                      multiline
                      name="country"
                      // value={patient.country}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Contact No.:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="contact_number"
                      // value={patient.contact_number}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Email Address:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="email"
                      // value={patient.email_address}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems="center" style={{ margin: "15px" }}>
                  <Grid item xs={12}>
                    <Typography variant="h6" align="left" color="textSecondary" gutterBottom>
                      Person to contact in case of Emergency
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Name:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="emergency_name"
                      // value={emergencyContact.emergency_name}
                      // onChange={emergencyContactHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Contact No.:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="emergency_contact_number"
                      // value={emergencyContact.emergency_contact_number}
                      // onChange={emergencyContactHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} />
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Relationship:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="emergency_relationship"
                      // value={emergencyContact.emergency_relationship}
                      // onChange={emergencyContactHandler}
                      inputRef={register}
                    />
                  </Grid>
                </Grid>
                <Grid container alignItems="center" style={{ margin: "15px" }}>
                  <Grid item xs={4}>
                    <Typography variant="h6" align="left" color="textSecondary" gutterBottom>
                      Other Information
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container alignItems="center" className={classes.gridInputMargin}>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      SSS/GSIS no.:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="sss_gsis_number"
                      // value={patient.sss_gsis_number}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      Philhealth no.:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="philhealth_number"
                      // value={patient.philhealth_number}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                  <Grid item xs={2} />
                  <Grid item xs={5} />
                  <Grid item xs={2} align="left">
                    <Typography variant="body1" align="left" color="textSecondary" gutterBottom>
                      HMO:
                    </Typography>
                  </Grid>
                  <Grid item xs={3} align="left">
                    <TextField
                      margin="dense"
                      variant="outlined"
                      name="hmo"
                      // value={patient.hmo}
                      // onChange={patientHandler}
                      inputRef={register}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  alignItems="center"
                  justify="flex-end"
                  style={{ marginTop: "30px" }}
                  spacing={2}
                >
                  <Grid item xs={2} lg={1} style={{ marginRight: "15px" }}>
                    <Button color="secondary" onClick={() => history.push("/patient/list")}>
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={2} lg={1} style={{ marginRight: "15px" }}>
                    <Button type="submit" variant="contained" color="primary">
                      Register
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
    </>
  );
};

export default PatientRegister;
