
type EmptyString = string; // "", " ", etc
type XMLString = string; // starts with "<?xml"
type HTMLString = string; // includes "</"
type URLString = string;
type TimeString = string; // hh:mm(am | pm)

export type Course = {

  /* e.g. "subject=AFRAMER&catnbr=%20%2011&classsection=001&classnbr=13878&crseid=123591&strm=2228" */
  Key: string,

  /* e.g. "Introduction to African Studies" */
  Name: string,

  /* e.g. "subject=AFRAMER&catnbr=%20%2011&classsection=001&classnbr=13878&crseid=123591&strm=2228" */
  LinkURL: string,

  /* e.g. "Introduction to African Studies" */
  Title: string,
  EnhancedSponsored: false,

  /* e.g. "subject=AFRAMER&catnbr=%20%2011&classsection=001&classnbr=13878&crseid=123591&strm=2228" */
  OriginalURL: string,
  HasActions: false,
  IsPeoplesoft: false,

  /* e.g. "hB4vxmAnsCVd889Nv44m2op60iU=" */
  SearchKey: string,
  Sponsored: false,
  Removed: false,

  /* e.g. "?p?This course introduces students to the rich diversity and complexity of Africa, including its historical dynamics, economic developments, social and political practices, and popular cultures. Throughout, we assume that Africa is not a unique isolate but a continent bubbling with internal diversit" */
  Description: string | EmptyString | HTMLString,
  Score: 1,

  /* e.g. "2022-08-10 20:11:11.000000" */
  Modified: string,

  /* e.g. "FAS" */
  ACAD_CAREER: "FAS",

  /* e.g. "AAAS" */
  ACAD_ORG: string[] | string,

  /* e.g. "2023" */
  ACAD_YEAR: "2023",

  /* e.g. "AFRAMER" */
  SUBJECT: string,

  /* e.g. "11" */
  CATALOG_NBR: string,

  /* e.g. "13878" */
  CLASS_NBR: string,

  /* e.g. "2228" */
  STRM: "2228",

  /* e.g. "001" */
  CLASS_SECTION: string,

  /* e.g. "001" */
  HU_CLS_SECN_DISP: EmptyString | string,

  /* e.g. "123591" */
  CRSE_ID: string,

  /* e.g. "Thursday" */
  DAY_OF_WEEK: ("Thursday" | "Wednesday" | "Monday" | "Tuesday" | "Friday") | ("Tuesday" | "Thursday" | "Monday" | "Wednesday" | "Friday")[],
  IS_SCL_DESCR: HTMLString | EmptyString,

  /* e.g. "O" */
  ENRL_STAT: ("O" | "C"),

  /* e.g. "Introduction to African Studies" */
  IS_SCL_DESCR100: string,

  /* e.g. "Faculty of Arts & Sciences" */
  IS_SCL_DESCR_IS_SCL_DESCRB: "Faculty of Arts & Sciences",

  /* e.g. "African & African Amer Studies" */
  IS_SCL_DESCR_IS_SCL_DESCRD: string,

  /* e.g. "2022 Fall" */
  IS_SCL_DESCR_IS_SCL_DESCRH: "2022 Fall",

  /* e.g. "Faculty of Arts & Sciences" */
  IS_SCL_DESCR_IS_SCL_DESCRI: "Faculty of Arts & Sciences",

  /* e.g. "Th" */
  IS_SCL_MEETING_PAT: ("Th" | "Tu Th" | "TBA" | "We" | "Mo" | "Tu" | "Fr" | "Mo We" | "Mo Th" | "We Fr" | "Mo We Fr" | "Mo Tu We Th Fr" | "Mo Tu We Th" | "Mo Fr" | "Mo Tu Th" | "Mo Tu Th Fr" | "Th Fr") | ("We" | "Fr" | "Mo We" | "Tu" | "Th" | "Mo" | "Mo Tu We Th" | "Mo We Fr" | "Tu Th")[],
  IS_SCL_TIME_END: TimeString | EmptyString | TimeString[],
  IS_SCL_TIME_START: TimeString | EmptyString | TimeString[],

  /* e.g. "Daniel Agbiboa" */
  IS_SCL_DESCR_IS_SCL_DESCRL: string | string[],

  /* e.g. "African & African Amer Studies" */
  IS_SCL_DESCR_IS_SCL_DESCRJ: string,

  /* e.g. "N" */
  MON: ("N" | "Y") | EmptyString | ("Y" | "N")[],

  /* e.g. "Agbiboa" */
  LAST_NAME: string | string[],

  /* e.g. "N" */
  SSR_DROP_CONSENT: ("N" | "I" | "D"),

  /* e.g. "Primarily for Undergraduate Students" */
  IS_SCL_DESCR100_HU_SCL_ATTR_LEVL: ("Primarily for Undergraduate... (string of length 36)" | "For Undergraduate and Gradu... (string of length 39)" | "Primarily for Graduate Stud... (string of length 31)" | "Graduate Course" | "No Course Level"),

  /* e.g. "Available for Harvard Cross Registration" */
  IS_SCL_DESCR100_HU_SCL_ATTR_XREG: ("Available for Harvard Cross... (string of length 40)" | "Not Available for Cross Reg... (string of length 36)"),

  /* e.g. "N" */
  CONSENT: ("N" | "I" | "D"),

  /* e.g. "999" */
  ENRL_CAP: string,

  /* e.g. "0" */
  ENRL_TOT: ("0" | "1" | "2" | "7" | "28" | "3" | "9" | "6" | "4"),

  /* e.g. "N" */
  FRI: ("N" | "Y") | EmptyString | ("N" | "Y")[],

  /* e.g. "4" */
  HU_UNITS_MIN: ("4" | "0" | "2" | "8"),

  /* e.g. "4" */
  HU_UNITS_MAX: ("4" | "16" | "0" | "2" | "8" | "12" | "164"),

  /* e.g. "Required of concentrators in African Studies track." */
  HU_COURSE_PREQ: string | "After Greek 10, students ma... (HTMLString of length 403)",

  /* e.g. "FAS Letter Graded" */
  IS_SCL_DESCR100_HU_SCL_GRADE_BASIS: ("FAS Letter Graded" | "FAS Satisfactory/Unsatisfac... (string of length 31)" | "FAS Ungraded" | "FAS Pass/Fail"),

  /* e.g. "11.7500" */
  IS_SCL_END_TM_DEC: string | string[],

  /* e.g. "9.7500" */
  IS_SCL_STRT_TM_DEC: string | ("9" | "12" | "15" | "16" | "10" | "9.7500" | "13" | "8.5000" | "19" | "14" | "18.7500" | "11" | "16.5000")[],

  /* e.g. "Y" */
  HU_SEC_COMP_FLAG: ("Y" | "N"),

  /* e.g. "001074" */
  RQRMNT_GROUP: EmptyString | string,

  /* e.g. "N" */
  HU_RECPREP_FLAG: ("N" | "Y"),

  /* e.g. "2020-04-13-00.00.00.000000" */
  EFFDT: string,

  /* e.g. "A" */
  CLASS_STAT: ("A" | "S" | "X"),

  /* e.g. "SOCSCI" */
  PARENT_NODE_NAME: ("SOCSCI" | "ARTS-HUM" | "SEAS" | "SCIENCE" | "HILS" | "FAS" | "HRVRD" | "HBS" | "MDSC"),

  /* e.g. "1" */
  CRSE_OFFER_NBR: ("1" | "2"),

  /* e.g. "1" */
  SESSION_CODE: ("1" | "DYN" | "F1" | "F2"),

  /* e.g. "11" */
  HU_CAT_NBR_NL: string | EmptyString,

  /* e.g. "AFRAMER11" */
  HU_SBJCT_CATNBR_NL: string,

  /* e.g. "1" */
  CLASS_MTG_NBR: ("1" | "0" | "2" | "4") | ("1" | "2" | "3" | "4" | "5")[],

  /* e.g. "12/09/2022 2:00 PM" */
  IS_SCL_DESCR_HU_SCL_EXAM_GROUP: ("12/09/2022 2:00 PM" | "12/15/2022 2:00 PM" | "12/17/2022 2:00 PM" | "12/10/2022 2:00 PM" | "12/16/2022 9:00 AM" | "12/17/2022 9:00 AM" | "12/16/2022 2:00 PM" | "12/08/2022 9:00 AM" | "12/14/2022 2:00 PM" | "12/12/2022 9:00 AM" | "12/09/2022 9:00 AM" | "12/14/2022 9:00 AM" | "12/13/2022 2:00 PM" | "12/15/2022 9:00 AM" | "12/08/2022 2:00 PM" | "12/10/2022 9:00 AM" | "12/12/2022 2:00 PM" | "12/13/2022 9:00 AM"),

  /* e.g. "AAAS" */
  ACAD_ORG_PRIMARY_ORG: string,

  /* e.g. "No Consent" */
  IS_SCL_DESCRSHORT_HU_CONSENT: ("No Consent" | "Instructor" | "Department"),

  /* e.g. "No Special Consent Required" */
  IS_SCL_DESCR_HU_CONSENT: ("No Special Consent Required" | "Instructor Consent Required" | "Department Consent Required"),

  /* e.g. "0" */
  CRS_TOPIC_ID: ("0" | "1" | "2" | "3"),

  /* e.g. "2022-08-31-00.00.00.000000" */
  START_DT: ("2022-08-31-00.00.00.000000" | "2022-09-01-00.00.00.000000" | "2022-10-17-00.00.00.000000") | EmptyString,

  /* e.g. "2022-12-01-00.00.00.000000" */
  END_DT: ("2022-12-01-00.00.00.000000" | "2022-10-14-00.00.00.000000") | EmptyString,

  /* e.g. "Full Term" */
  IS_SCL_DESCR_HU_SCL_SESSION: ("Full Term" | "Dynamically Dated" | "Fall 1" | "Fall 2"),
  IS_SCL_DESCR_HU_SCL_DESCRNOHTML: HTMLString,

  /* e.g. "0" */
  HU_WAIT_CAP: ("0" | "999"),

  /* e.g. "X|*|Daniel Agbiboa|*||*||*||*|X" */
  PROFILEBUTTON: string | string[],

  /* e.g. "Lecture" */
  SSR_COMPONENTDESCR: string,
  URL_URLNAME: URLString,

  /* e.g. "Social Sciences" */
  IS_SCL_DESCR100_HU_SCL_ATTR_LDD: ("Social Sciences" | "Arts and Humanities" | "None" | "Science & Engineering & App... (string of length 39)"),

  /* e.g. "DIS|***|DIS|***|Discussion|***|DIS|*|N|*|N|*|N|*|N|*|N|*|N|*|N|*||*||*| |*||*|1" */
  IS_SCL_DESCR_HU_SCL_SEC_COMP: string | string[],

  /* e.g. "PRIMUGRD" */
  CRSE_ATTR_VALUE_HU_LEVL_ATTR: ("PRIMUGRD" | "UGRDGRAD" | "PRIMGRAD" | "GRADCOURSE" | "NOLEVEL"),

  /* e.g. "SOC" */
  CRSE_ATTR_VALUE_HU_LDD_ATTR: ("SOC" | "A&H" | "NONE" | "SCI"),

  /* e.g. "YESXREG" */
  CRSE_ATTR_VALUE_HU_XREG_ATTR: ("YESXREG" | "NOXREG"),

  /* e.g. "N" */
  SAT: "N" | EmptyString,

  /* e.g. "Y" */
  THURS: ("Y" | "N") | EmptyString | ("N" | "Y")[],

  /* e.g. "N" */
  TUES: ("N" | "Y") | EmptyString | ("Y" | "N")[],

  /* e.g. "N" */
  WED: ("N" | "Y") | EmptyString | ("Y" | "N")[],
  HU_INSTRUCT_MODE: EmptyString,

  /* e.g. "Cambridge Campus" */
  LOCATION_DESCR_LOCATION: ("Cambridge Campus" | "Allston Campus" | "Longwood Campus" | "Off Campus Location" | "Mass Institute of Technology" | "Harvard Divinity School"),

  /* e.g. "2228_13878" */
  HU_STRM_CLASSNBR: string,

  /* e.g. "AFRAMER11" */
  HU_SUBJ_CATLG_NBR: string,
  COOP_LINK: XMLString,

  /* e.g. "2022-08-31-00.00.00.000000" */
  ClassStartDt: ("2022-08-31-00.00.00.000000" | "2022-08-31" | "2022-09-01-00.00.00.000000" | "2022-10-17-00.00.00.000000") | EmptyString,

  /* e.g. "2022-12-01-00.00.00.000000" */
  ClassEndDt: ("2022-12-01-00.00.00.000000" | "2022-12-01" | "2022-10-14" | "2022-10-14-00.00.00.000000") | EmptyString,

  /* e.g. "N" */
  ShopCartOpenCheck: "N",

  /* e.g. "Completion of African and African American Studies 10, or a substitute course approved by the Director of Undergraduate Studies." */
  HU_REC_PREP: string | HTMLString,
  IS_SCL_DESCR_IS_SCL_DESCRN: HTMLString | HTMLString[],

  /* e.g. "Faculty of Arts & Sciences}{2228}{17778}{HAA}{193X" */
  IS_SCL_DESCR_HU_SCL_XREG: string | string[],

  /* e.g. "The American Gender Archive" */
  DESCRFORMAL_COURSE_TOPIC: string,
  MultiSection: {

    /* e.g. "Section1" */
    Key: ("Section1" | "Section2" | "Section3"),
    CourseMtgNmbr1: ("1" | "4" | "2"),

    /* e.g. "0" */
    CrseTopicId: "0",

    /* e.g. "2022-08-31" */
    START_DT: "2022-08-31",

    /* e.g. "2022-12-01" */
    END_DT: ("2022-12-01" | "2022-10-14"),

    /* e.g. "We" */
    IS_SCL_MEETING_PAT: ("We" | "Fr" | "Mo We" | "Tu" | "Th" | "Mo" | "Mo Tu We Th" | "Mo We Fr" | "Tu Th"),
    IS_SCL_TIME_START: TimeString,
    IS_SCL_TIME_END: TimeString,

    /* e.g. "FS---16547" */
    FacilityId: ("FS---16547" | "FSXXXXXX37" | "SEC-544184" | "WA--211+12" | "FS---18883" | "US--149081" | "SEC-544275" | "FS---15718" | "FS---12554" | "FS---12651" | "FS---60159" | "FS----6708" | "FS--294230" | "FS----6176") | EmptyString,
    BLDG_CD: EmptyString,
    DESCR: EmptyString,

    /* e.g. "0" */
    HU_LATITUDE: "0",

    /* e.g. "0" */
    HU_LONGITUDE: "0",

    /* e.g. "N" */
    Mo: ("N" | "Y"),

    /* e.g. "N" */
    Tu: ("N" | "Y"),

    /* e.g. "Y" */
    We: ("Y" | "N"),

    /* e.g. "N" */
    Th: ("N" | "Y"),

    /* e.g. "N" */
    Fr: ("N" | "Y"),

    /* e.g. "N" */
    Sa: "N",

    /* e.g. "N" */
    Su: "N",
    CourseMtgNmbr2: ("2" | "3" | "5"),
    CourseMtgNmbr3: "3",
  }[],

  /* e.g. "Course open to Graduate Students Only" */
  HU_COURSE_REQ: string,

  /* e.g. "Yes" */
  IS_SCL_DESCR100_HU_SCL_ATTR_LQR: "Yes",

  /* e.g. "AP" */
  HU_ALIAS: ("AP" | "AM" | "ASTRO" | "CS" | "HDRB" | "EPS" | "EC" | "WGS" | "ES" | "HIST LIT" | "HUM" | "LS" | "PS" | "PSYCH" | "SOC"),

  /* e.g. "AP282" */
  HU_ALIAS_CATNBR_NL: string | ("PSYCH1576" | "PSYCH980")[],

  /* e.g. "AP282" */
  HU_ALIAS_CATNBR_NS: string | ("PSYCH1576" | "PSYCH980JS")[],
  IS_SCL_DESCR100_HU_SCL_ATTR_AREC: "MDE approved SEAS 100 level... (string of length 34)",
  CRSE_ATTR_VALUE_HU_AREC_ATTR: "E-MDE-SEAS",

  /* e.g. "Histories, Societies, Individuals" */
  IS_SCL_DESCR100_HU_SCL_ATTR_GE: ("Histories, Societies, Indiv... (string of length 33)" | "Aesthetics and Culture" | "Science and Technology in S... (string of length 33)" | "Ethics and Civics") | ("Ethics and Civics" | "Histories, Societies, Indiv... (string of length 33)" | "Science and Technology in S... (string of length 33)")[],

  /* e.g. "HSI" */
  CRSE_ATTR_VALUE_HU_GE_ATTR: ("HSI" | "A&C" | "STS" | "E&C") | ("E&C" | "HSI" | "STS")[],
};
