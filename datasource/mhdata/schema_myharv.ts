
type EmptyString = string; // "", " ", etc
type XMLString = string; // starts with "<?xml"
type HTMLString = string; // includes "</"
type URLString = string; // starts with "http" and is a valid URL
type TimeString = string; // hh:mm(am | pm)
type LongString<T> = string; // used in place of actual string in an enum when the string is too long

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
  ACAD_CAREER: "FAS",

  /* e.g. "AAAS" */
  ACAD_ORG: string[] | string,
  ACAD_YEAR: "2023",

  /* e.g. "AFRAMER" */
  SUBJECT: string,

  /* e.g. "11" */
  CATALOG_NBR: string,

  /* e.g. "13878" */
  CLASS_NBR: string,
  STRM: "2228",

  /* e.g. "001" */
  CLASS_SECTION: string,

  /* e.g. "001" */
  HU_CLS_SECN_DISP: EmptyString | string,

  /* e.g. "123591" */
  CRSE_ID: string,
  DAY_OF_WEEK: ("Thursday" | "Wednesday" | "Monday" | "Tuesday" | "Friday") | ("Tuesday" | "Thursday" | "Monday" | "Wednesday" | "Friday")[],
  IS_SCL_DESCR: HTMLString | EmptyString,
  ENRL_STAT: ("O" | "C"),

  /* e.g. "Introduction to African Studies" */
  IS_SCL_DESCR100: string,
  IS_SCL_DESCR_IS_SCL_DESCRB: "Faculty of Arts & Sciences",

  /* e.g. "African & African Amer Studies" */
  IS_SCL_DESCR_IS_SCL_DESCRD: string,
  IS_SCL_DESCR_IS_SCL_DESCRH: "2022 Fall",
  IS_SCL_DESCR_IS_SCL_DESCRI: "Faculty of Arts & Sciences",
  IS_SCL_MEETING_PAT: ("Th" | "Tu Th" | "TBA" | "We" | "Mo" | "Tu" | "Fr" | "Mo We" | "Mo Th" | "We Fr" | "Mo We Fr" | "Mo Tu We Th Fr" | "Mo Tu We Th" | "Mo Fr" | "Mo Tu Th" | "Mo Tu Th Fr" | "Th Fr") | ("We" | "Fr" | "Mo We" | "Tu" | "Th" | "Mo" | "Mo Tu We Th" | "Mo We Fr" | "Tu Th")[],
  IS_SCL_TIME_END: TimeString | EmptyString | TimeString[],
  IS_SCL_TIME_START: TimeString | EmptyString | TimeString[],

  /* e.g. "Daniel Agbiboa" */
  IS_SCL_DESCR_IS_SCL_DESCRL: string | string[],

  /* e.g. "African & African Amer Studies" */
  IS_SCL_DESCR_IS_SCL_DESCRJ: string,
  MON: ("N" | "Y") | EmptyString | ("Y" | "N")[],

  /* e.g. "Agbiboa" */
  LAST_NAME: string | string[],
  SSR_DROP_CONSENT: ("N" | "I" | "D"),
  IS_SCL_DESCR100_HU_SCL_ATTR_LEVL: ("Primarily for Undergraduate Students" | "For Undergraduate and Graduate Students" | "Primarily for Graduate Students" | "Graduate Course" | "No Course Level"),
  IS_SCL_DESCR100_HU_SCL_ATTR_XREG: ("Available for Harvard Cross Registration" | "Not Available for Cross Registration"),
  CONSENT: ("N" | "I" | "D"),

  /* e.g. "999" */
  ENRL_CAP: string,
  ENRL_TOT: ("0" | "1" | "2" | "7" | "28" | "3" | "9" | "6" | "4"),
  FRI: ("N" | "Y") | EmptyString | ("N" | "Y")[],
  HU_UNITS_MIN: ("4" | "0" | "2" | "8"),
  HU_UNITS_MAX: ("4" | "16" | "0" | "2" | "8" | "12" | "164"),

  /* e.g. "Required of concentrators in African Studies track." */
  HU_COURSE_PREQ: string | LongString<HTMLString>,
  IS_SCL_DESCR100_HU_SCL_GRADE_BASIS: ("FAS Letter Graded" | "FAS Satisfactory/Unsatisfactory" | "FAS Ungraded" | "FAS Pass/Fail"),

  /* e.g. "11.7500" */
  IS_SCL_END_TM_DEC: string | string[],

  /* e.g. "9.7500" */
  IS_SCL_STRT_TM_DEC: string | ("9" | "12" | "15" | "16" | "10" | "9.7500" | "13" | "8.5000" | "19" | "14" | "18.7500" | "11" | "16.5000")[],
  HU_SEC_COMP_FLAG: ("Y" | "N"),

  /* e.g. "001074" */
  RQRMNT_GROUP: EmptyString | string,
  HU_RECPREP_FLAG: ("N" | "Y"),

  /* e.g. "2020-04-13-00.00.00.000000" */
  EFFDT: string,
  CLASS_STAT: ("A" | "S" | "X"),
  PARENT_NODE_NAME: ("SOCSCI" | "ARTS-HUM" | "SEAS" | "SCIENCE" | "HILS" | "FAS" | "HRVRD" | "HBS" | "MDSC"),
  CRSE_OFFER_NBR: ("1" | "2"),
  SESSION_CODE: ("1" | "DYN" | "F1" | "F2"),

  /* e.g. "11" */
  HU_CAT_NBR_NL: string | EmptyString,

  /* e.g. "AFRAMER11" */
  HU_SBJCT_CATNBR_NL: string,
  CLASS_MTG_NBR: ("1" | "0" | "2" | "4") | ("1" | "2" | "3" | "4" | "5")[],
  IS_SCL_DESCR_HU_SCL_EXAM_GROUP: ("12/09/2022 2:00 PM" | "12/15/2022 2:00 PM" | "12/17/2022 2:00 PM" | "12/10/2022 2:00 PM" | "12/16/2022 9:00 AM" | "12/17/2022 9:00 AM" | "12/16/2022 2:00 PM" | "12/08/2022 9:00 AM" | "12/14/2022 2:00 PM" | "12/12/2022 9:00 AM" | "12/09/2022 9:00 AM" | "12/14/2022 9:00 AM" | "12/13/2022 2:00 PM" | "12/15/2022 9:00 AM" | "12/08/2022 2:00 PM" | "12/10/2022 9:00 AM" | "12/12/2022 2:00 PM" | "12/13/2022 9:00 AM"),

  /* e.g. "AAAS" */
  ACAD_ORG_PRIMARY_ORG: string,
  IS_SCL_DESCRSHORT_HU_CONSENT: ("No Consent" | "Instructor" | "Department"),
  IS_SCL_DESCR_HU_CONSENT: ("No Special Consent Required" | "Instructor Consent Required" | "Department Consent Required"),
  CRS_TOPIC_ID: ("0" | "1" | "2" | "3"),
  START_DT: ("2022-08-31-00.00.00.000000" | "2022-09-01-00.00.00.000000" | "2022-10-17-00.00.00.000000") | EmptyString,
  END_DT: ("2022-12-01-00.00.00.000000" | "2022-10-14-00.00.00.000000") | EmptyString,
  IS_SCL_DESCR_HU_SCL_SESSION: ("Full Term" | "Dynamically Dated" | "Fall 1" | "Fall 2"),
  IS_SCL_DESCR_HU_SCL_DESCRNOHTML: HTMLString,
  HU_WAIT_CAP: ("0" | "999"),

  /* e.g. "X|*|Daniel Agbiboa|*||*||*||*|X" */
  PROFILEBUTTON: string | string[],

  /* e.g. "Lecture" */
  SSR_COMPONENTDESCR: string,
  URL_URLNAME: URLString,
  IS_SCL_DESCR100_HU_SCL_ATTR_LDD: ("Social Sciences" | "Arts and Humanities" | "None" | "Science & Engineering & Applied Science"),

  /* e.g. "DIS|***|DIS|***|Discussion|***|DIS|*|N|*|N|*|N|*|N|*|N|*|N|*|N|*||*||*| |*||*|1" */
  IS_SCL_DESCR_HU_SCL_SEC_COMP: string | string[],
  CRSE_ATTR_VALUE_HU_LEVL_ATTR: ("PRIMUGRD" | "UGRDGRAD" | "PRIMGRAD" | "GRADCOURSE" | "NOLEVEL"),
  CRSE_ATTR_VALUE_HU_LDD_ATTR: ("SOC" | "A&H" | "NONE" | "SCI"),
  CRSE_ATTR_VALUE_HU_XREG_ATTR: ("YESXREG" | "NOXREG"),
  SAT: "N" | EmptyString,
  THURS: ("Y" | "N") | EmptyString | ("N" | "Y")[],
  TUES: ("N" | "Y") | EmptyString | ("Y" | "N")[],
  WED: ("N" | "Y") | EmptyString | ("Y" | "N")[],
  HU_INSTRUCT_MODE: EmptyString,
  LOCATION_DESCR_LOCATION: ("Cambridge Campus" | "Allston Campus" | "Longwood Campus" | "Off Campus Location" | "Mass Institute of Technology" | "Harvard Divinity School"),

  /* e.g. "2228_13878" */
  HU_STRM_CLASSNBR: string,

  /* e.g. "AFRAMER11" */
  HU_SUBJ_CATLG_NBR: string,
  COOP_LINK: XMLString,
  ClassStartDt: ("2022-08-31-00.00.00.000000" | "2022-08-31" | "2022-09-01-00.00.00.000000" | "2022-10-17-00.00.00.000000") | EmptyString,
  ClassEndDt: ("2022-12-01-00.00.00.000000" | "2022-12-01" | "2022-10-14" | "2022-10-14-00.00.00.000000") | EmptyString,
  ShopCartOpenCheck: "N",

  /* e.g. "Completion of African and African American Studies 10, or a substitute course approved by the Director of Undergraduate Studies." */
  HU_REC_PREP: string | HTMLString,
  IS_SCL_DESCR_IS_SCL_DESCRN: HTMLString | HTMLString[],

  /* e.g. "Faculty of Arts & Sciences}{2228}{17778}{HAA}{193X" */
  IS_SCL_DESCR_HU_SCL_XREG: string | string[],

  /* e.g. "The American Gender Archive" */
  DESCRFORMAL_COURSE_TOPIC: string,
  MultiSection: {
    Key: ("Section1" | "Section2" | "Section3"),
    CourseMtgNmbr1: ("1" | "4" | "2"),
    CrseTopicId: "0",
    START_DT: "2022-08-31",
    END_DT: ("2022-12-01" | "2022-10-14"),
    IS_SCL_MEETING_PAT: ("We" | "Fr" | "Mo We" | "Tu" | "Th" | "Mo" | "Mo Tu We Th" | "Mo We Fr" | "Tu Th"),
    IS_SCL_TIME_START: TimeString,
    IS_SCL_TIME_END: TimeString,
    FacilityId: ("FS---16547" | "FSXXXXXX37" | "SEC-544184" | "WA--211+12" | "FS---18883" | "US--149081" | "SEC-544275" | "FS---15718" | "FS---12554" | "FS---12651" | "FS---60159" | "FS----6708" | "FS--294230" | "FS----6176") | EmptyString,
    BLDG_CD: EmptyString,
    DESCR: EmptyString,
    HU_LATITUDE: "0",
    HU_LONGITUDE: "0",
    Mo: ("N" | "Y"),
    Tu: ("N" | "Y"),
    We: ("Y" | "N"),
    Th: ("N" | "Y"),
    Fr: ("N" | "Y"),
    Sa: "N",
    Su: "N",
    CourseMtgNmbr2: ("2" | "3" | "5"),
    CourseMtgNmbr3: "3",
  }[],

  /* e.g. "Course open to Graduate Students Only" */
  HU_COURSE_REQ: string,
  IS_SCL_DESCR100_HU_SCL_ATTR_LQR: "Yes",
  HU_ALIAS: ("AP" | "AM" | "ASTRO" | "CS" | "HDRB" | "EPS" | "EC" | "WGS" | "ES" | "HIST LIT" | "HUM" | "LS" | "PS" | "PSYCH" | "SOC"),

  /* e.g. "AP282" */
  HU_ALIAS_CATNBR_NL: string | ("PSYCH1576" | "PSYCH980")[],

  /* e.g. "AP282" */
  HU_ALIAS_CATNBR_NS: string | ("PSYCH1576" | "PSYCH980JS")[],
  IS_SCL_DESCR100_HU_SCL_ATTR_AREC: "MDE approved SEAS 100 level course",
  CRSE_ATTR_VALUE_HU_AREC_ATTR: "E-MDE-SEAS",
  IS_SCL_DESCR100_HU_SCL_ATTR_GE: ("Histories, Societies, Individuals" | "Aesthetics and Culture" | "Science and Technology in Society" | "Ethics and Civics") | ("Ethics and Civics" | "Histories, Societies, Individuals" | "Science and Technology in Society")[],
  CRSE_ATTR_VALUE_HU_GE_ATTR: ("HSI" | "A&C" | "STS" | "E&C") | ("E&C" | "HSI" | "STS")[],
};
