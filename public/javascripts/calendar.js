window.addEventListener("load", initCalendar);

function initCalendar() {
  $(function () {
    var start = moment().subtract(0, "days");
    var end = moment();

    function cb(start, end) {
      updateTimeScaleAll(start.format("YYYY-MM-DD") + " 00:00:00", end.format("YYYY-MM-DD") + " 24:00:00", true);
      updateTimeScale(start.format("YYYY-MM-DD") + " 00:00:00", end.format("YYYY-MM-DD") + " 24:00:00", true);
      $("#reportrange span").html(start.format("MMMM D, YYYY") + " - " + end.format("MMMM D, YYYY"));
    }

    $("#reportrange").daterangepicker(
      {
        startDate: start,
        endDate: end,
        ranges: {
          Today: [moment(), moment()],
          Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
        },
      },
      cb
    );

    cb(start, end);
  });
}
