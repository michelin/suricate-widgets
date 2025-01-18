function run() {
  var data = {};
  var projectIssues = [];
  var sonarUrl = CATEGORY_SONAR_URL.replace(/\/+$/, "");
  var sonarToken = CATEGORY_SONAR_TOKEN;
  var projectKeys = WIDGET_PROJECT_KEY;
  var labels = [];
  var dataCodeSmell = [];
  var dataBug = [];
  var dataVulnerability = [];
  var history = [];
  var dataCodeSmellCount = 0;
  var dataBugCount = 0;
  var dataVulnerabilityCount = 0;
  var pageSize = 500;
  var projectPage = 1;
  var border = "#607D8B";
  var displayDate;
  var dateExtract;
  var dateFirstTen;

  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function zeroTest(element) {
    return element === 0;
  }

  if (WIDGET_PERIOD_UNIT) {
    var numberOfPeriods = 1;

    if (WIDGET_PERIOD_NUMBER) {
      numberOfPeriods = WIDGET_PERIOD_NUMBER;
    }

    var computedDate = new Date();

    if (WIDGET_PERIOD_UNIT === "Day") {
      computedDate.setDate(new Date().getDate() - numberOfPeriods);
    } else if (WIDGET_PERIOD_UNIT === "Week") {
      computedDate.setDate(new Date().getDate() - 7 * numberOfPeriods);
    } else if (WIDGET_PERIOD_UNIT === "Month") {
      computedDate.setMonth(new Date().getMonth() - numberOfPeriods);
    } else if (WIDGET_PERIOD_UNIT === "Year") {
      computedDate.setFullYear(new Date().getFullYear() - numberOfPeriods);
    }

    computedDate.setUTCHours(0, 0, 0, 0);

    data.fromDate =
      computedDate.getFullYear() +
      "-" +
      ("0" + (computedDate.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + computedDate.getUTCDate()).slice(-2);
  }

  var projectPage = 1;
  var pageSize = 500;
  var response = getIssuesFromSonarqube(
    sonarUrl,
    sonarToken,
    projectKeys,
    pageSize,
    projectPage,
    data.fromDate
  );

  if (response && response.measures && response.measures.length > 0) {
    projectIssues = response.measures;

    while (
      response.paging.total >
      response.paging.pageIndex * response.paging.pageSize
    ) {
      projectPage++;

      response = getIssuesFromSonarqube(
        sonarUrl,
        sonarToken,
        projectKeys,
        pageSize,
        projectPage,
        data.fromDate
      );

      projectIssues = projectIssues.concat(response.measures);
    }
  }

  projectIssues.forEach(function (measure) {
    var issueTypeVal = measure.metric;

    history = measure.history;

    history.sort(function (a, b) {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    var uniqueHistory = uniqueHistoryData(history);

    uniqueHistory.forEach(function (h) {
      dateExtract = new Date(h.date);
      dateFirstTen =
        dateExtract.getFullYear() +
        "-" +
        ("0" + (dateExtract.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + dateExtract.getUTCDate()).slice(-2);

      if (WIDGET_PERIOD_UNIT == "Day") {
        displayDate = dateFirstTen;
      } else if (WIDGET_PERIOD_UNIT == "Week") {
        displayDate = dateFirstTen;
      } else if (WIDGET_PERIOD_UNIT == "Month") {
        displayDate =
          monthNames[dateExtract.getMonth()] + "," + dateExtract.getFullYear();
      } else if (WIDGET_PERIOD_UNIT == "Year") {
        displayDate = dateExtract.getFullYear();
      }

      if (labels.indexOf(displayDate) == -1) {
        labels.push(displayDate);
      }
    });

    if (issueTypeVal == "bugs") {

      uniqueHistory.forEach(function (hist) {
        
          bugDate = hist.date;
          dataBugCount = hist.value;
          dataBug.push(dataBugCount);
        
      });
    } else if (issueTypeVal == "code_smells") {
      

      uniqueHistory.forEach(function (hist) {
        
          codeSmellDate = hist.date;
          dataCodeSmellCount = hist.value;
          dataCodeSmell.push(dataCodeSmellCount);
        
      });
    } else {
      uniqueHistory.forEach(function (hist) {
        
          vulnerabilityDate = hist.date;
          dataVulnerabilityCount = hist.value;
          dataVulnerability.push(dataVulnerabilityCount);
       
      });
    }
  });

  data.labels = JSON.stringify(labels);
  data.dataBug = JSON.stringify(dataBug.every(zeroTest) ? [] : dataBug);
  data.dataCodeSmell = JSON.stringify(
    dataCodeSmell.every(zeroTest) ? [] : dataCodeSmell
  );
  data.dataVulnerability = JSON.stringify(
    dataVulnerability.every(zeroTest) ? [] : dataVulnerability
  );

  data.border = JSON.stringify(border);

  return JSON.stringify(data);
}

function getIssuesFromSonarqube(
  sonarUrl,
  sonarToken,
  projectKeys,
  pageSize,
  projectPage,
  fromDate
) {
  var sonarApiUrl =
    sonarUrl +
    "/api/measures/search_history?" +
    (WIDGET_BRANCH != null ? "branch=" + WIDGET_BRANCH + "&" : (WIDGET_PULL_REQUEST != null ? "pullRequest=" + WIDGET_PULL_REQUEST + "&" : "")) +
    "metrics=bugs,vulnerabilities,code_smells&component=" +
    projectKeys +
    "&ps=" +
    pageSize +
    "&p=" +
    projectPage;

  if (fromDate) {
    sonarApiUrl = sonarApiUrl + "&from=" + fromDate;
  }

  return JSON.parse(
    Packages.get(
      sonarApiUrl,
      "Authorization",
      "Basic " + Packages.btoa(sonarToken + ":")
    )
  );
}

function uniqueHistoryData(data){
  var obj = {};
  var uniqueHistoryArr = [];

  data.forEach(function(historyData){
      var month = new Date(historyData.date).getMonth()
      if(!obj[month]){
          obj[month] = [];    
      }

      obj[month].push(historyData)
  })

  for(var key in obj){
    uniqueHistoryArr.push(obj[key][obj[key].length - 1])
  }
  return uniqueHistoryArr;
}
