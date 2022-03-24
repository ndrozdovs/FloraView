window.addEventListener("load", initCalendar);

function initCalendar() {
  $(function () {
    function cb(start, end) {
      updateTimeScaleAll(start.format("YYYY-MM-DD") + " 00:00:00", end.format("YYYY-MM-DD") + " 24:00:00", true);
      updateTimeScale(start.format("YYYY-MM-DD") + " 00:00:00", end.format("YYYY-MM-DD") + " 24:00:00", true);
      if(start.format("YYYY-MM-DD")[0] !== "1"){
        $("#reportrange span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"));
      }
    }

    $("#reportrange").daterangepicker(
      {
        startDate: moment().subtract(30, "year").startOf("year"),
        endDate: moment().subtract(30, "year").endOf("year"),
        ranges: {
          "Latest Data": [moment().subtract(30, "year").startOf("year"), moment().subtract(30, "year").endOf("year")],
          Today: [moment(), moment()],
          Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
        },
      },
      cb
    );
  });
}
