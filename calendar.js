// Spanish days
moment.locale('es');

var start = moment('2015-01-01');
var end = moment('2016-01-01');

var months = moment.months();
var currentMonth = 0;
var week = 1;
var $table;
var holidays = ['01-01', '02-16', '02-17', '03-23', '03-24', '04-02', '04-03', '05-01', '05-25', '06-20', '07-09', '08-17', '10-12', '11-23', '12-07', '12-08', '12-25'];

// start the week on Monday
var date = moment(start).startOf('week').isoWeekday(1);

// First week of the year (starts in Dec 28 2014 instead Jan 1 2015)
date.week(1);

var insertPicture = function(month) {
  $('<img src="photos/4/' + (month + 1) + '.jpg" />').appendTo('body');
};

var insertMonthName = function(month) {
  $('<h1>' + months[month] + '</h1>').appendTo('body');
};

var insertCalendarTable = function() {
  $table = $('<table class="calendar"></table>').appendTo('body');
};

var insertWeekdays = function() {
  var weekdaysTemplate = '<thead><tr>';
  var weekdays = moment.weekdays();

  // make Monday the first day of the week
  var sunday = weekdays.shift();
  weekdays.push(sunday);

  $.each(weekdays, function(index, dayName) {
    weekdaysTemplate += '<th>' + dayName + '</th>';
  });

  weekdaysTemplate += '</tr></thead>';

  $(weekdaysTemplate).appendTo($table);
};

insertPicture(0);
insertMonthName(0);
insertCalendarTable();
insertWeekdays();

while (date.isBefore(end)) {
  var $tr = $('<tr/>').appendTo($table);

  for (var i = 0; i < 7; i++) {
    var day = date.format('DD');

    if (holidays.indexOf(date.format('MM-DD')) >= 0) {
      day = '<span class="holiday">' + day + '</span>';
    }

    var dayElement = '<td>' + day + '</td>';
    // Checks if the current day is from last month OR last year
    if (date.month() < currentMonth || date.year() < start.year()) {
      dayElement = '<td class="prev-month">' + day + '</td>';
    }
    // Checks if the current day if from the next month OR next year
    if ((date.month() > currentMonth && date.year() >= start.year()) || date.year() >= end.year()) {
      dayElement = '<td class="next-month">' + day + '</td>';
    }

    $tr.append(dayElement);
    date.add('days', 1);
  };

  if (date.month() > currentMonth) {
    currentMonth++;

    insertPicture(currentMonth);
    insertMonthName(currentMonth);
    insertCalendarTable();
    insertWeekdays();

    // if Monday is not 1st, we are going to show the last days of the
    // last month
    var temp = moment(date);
    temp.subtract('days', 7);

    if (date.day() !== 1 || date.format('DD') != "01") {
      date.subtract('days', 7);
    }
  }
}
