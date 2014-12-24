// Spanish days
moment.locale('es');

var a = moment('2015-01-01');
var b = moment('2016-01-01');
var months = moment.months();
var currentMonth = 0;
var week = 1;
var $table;
var holidays = ['01-01', '02-16', '02-17', '03-23', '03-24', '04-02', '04-03', '05-01', '05-25', '06-20', '07-09', '08-17', '10-12', '11-23', '12-07', '12-08', '12-25'];
var weekdays = "<thead><tr><th>Lunes</th><th>Martes</th><th>Miércoles</th><th>Jueves</th><th>Viernes</th><th>Sábado</th><th>Domingo</th></tr></thead>";

var insertPicture = function(month) {
  $('<img src="photos/4/' + (month + 1) + '.jpg" />').appendTo('body');
};

var insertMonthName = function(month) {
  $('<h1>' + months[month] + '</h1>').appendTo('body');
};

var insertCalendarTable = function() {
  $table = $('<table class="calendar"></table>').appendTo('body');
  $(weekdays).appendTo($table);
};

insertPicture(0);
insertMonthName(0);
insertCalendarTable();

// start the week on Monday
var date = moment(a).startOf('week').isoWeekday(1);

// date is not in the first iso week (starts in Dec 28 2014 instead Jan 1 2015)
date.isoWeek(week);

for (var m = a; m.isBefore(b); m.add('days', 7)) {
  var tr = $('<tr/>').appendTo($table);

  for (var i = 0; i < 7; i++) {
    var day = date.format('DD');
    if (holidays.indexOf(date.format('MM-DD')) >= 0) {
      day = '<span class="holiday">' + day + '</span>';
    }
    var dayElement = '<td>' + day + '</td>';
    if (date.month() < currentMonth || date.year() < a.year()) {
      dayElement = '<td class="prev-month">' + day + '</td>';
    }

    if ((date.month() > currentMonth && date.year() >= a.year()) || date.year() >= b.year()) {
      dayElement = '<td class="next-month">' + day + '</td>';
    }

    tr.append(dayElement);
    date.add('days', 1);
  };

  week++;
  date.isoWeek(week);

  if (date.month() > currentMonth) {
    currentMonth++;

    insertPicture(currentMonth);
    insertMonthName(currentMonth);
    insertCalendarTable();

    var temp = moment(date);
    temp.subtract('days', 7);
    if (date.day() !== 1 || date.format('DD') != "01") {
      date.subtract('days', 7);
    }
  }
}
