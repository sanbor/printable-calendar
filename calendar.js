$(function() {
  var date = moment().date(1).month(0);
  var year = moment(date).year();
  var pageSizes = {
    'a4': {
      width: '210mm',
      height: '297mm'
    },
    'a3': {
      width: '297mm',
      height: '420mm'
    },
    'letter': {
      width: '8.5in',
      height: '11in'
    }
  };

  $('.fromPeriod').val(moment(date).year(++year).format('YYYY-MM-DD'));
  $('.toPeriod').val(moment(date).year(++year).format('YYYY-MM-DD'));

  $('.printCalendar').click(function(event) {
    event.preventDefault();
    if ($('.pageSize').val() === 'custom') {
      less.modifyVars({
        '@pageWidth': $('.pageWidth').val() + $('.widthUnit').val(),
        '@pageHeight': $('.pageHeight').val() + $('.heightUnit').val()
      });
    } else {
      var selectedSize = $('.pageSize').val();
      var pageSize = pageSizes[selectedSize];
      $('body').addClass(selectedSize);
      less.modifyVars({
        '@pageWidth': pageSize.width,
        '@pageHeight': pageSize.height
      });
    }
    $('body').toggleClass('separatePicture', $('.pictureSeparate').prop('checked'));
    var from = $('.fromPeriod').val();
    var to = $('.toPeriod').val();
    generateCalendar(from, to);

    window.print();
  });
});

function generateCalendar(from, to) {
  // clean previous calendar
  $('.printableCalendar').empty();

  // Spanish days
  moment.locale('es');
  var startOnModay = true;

  var from = moment(from);
  var to = moment(to);

  var months = moment.months();
  var currentMonth = 0;
  var week = 1;
  var $table;
  var holidays = ['01-01', '02-16', '02-17', '03-23', '03-24', '04-02', '04-03', '05-01', '05-25', '06-20', '07-09', '08-17', '10-12', '11-23', '12-07', '12-08', '12-25'];

  // First week of the year (starts in Dec 28 2014 instead Jan 1 2015)
  var date = moment(from)

  if (startOnModay) {
    // start the week on Monday
    date.day(1);
  } else {
    // start the week on Sunday
    date.day(0);
  }

  var insertPicture = function(month) {
    $('<img src="photos/4/' + (month + 1) + '.jpg" />').appendTo('.printableCalendar');
  };

  var insertCalendar = function(month) {
    var $Calendar = $('<div class="Calendar"></div>').appendTo('.printableCalendar');

    $('<h1>' + months[month] + '</h1>').appendTo($Calendar);
    $table = $('<table class="Calendar-table"></table>').appendTo($Calendar);
    insertWeekdays();
  };

  var insertWeekdays = function() {
    var weekdaysTemplate = '<thead><tr>';
    var weekdays = moment.weekdays();

    // make Monday the first day of the week
    if (startOnModay) {
      var sunday = weekdays.shift();
      weekdays.push(sunday);
    }
    $.each(weekdays, function(index, dayName) {
      weekdaysTemplate += '<th>' + dayName + '</th>';
    });

    weekdaysTemplate += '</tr></thead>';

    $(weekdaysTemplate).appendTo($table);
  };

  insertPicture(0);
  insertCalendar(0);

  while (date.isBefore(to)) {
    var $tr = $('<tr/>').appendTo($table);

    for (var i = 0; i < 7; i++) {
      var day = date.format('DD');

      if (holidays.indexOf(date.format('MM-DD')) >= 0) {
        day = '<span class="holiday">' + day + '</span>';
      }

      var dayElement = '<td>' + day + '</td>';
      // Checks if the current day is from last month OR last year
      // BUG: doesn't work in January with calendars longer than a year
      if (date.month() < currentMonth || date.year() < from.year()) {
        dayElement = '<td class="prev-month">' + day + '</td>';
      }
      // Checks if the current day is from the next month and this year
      // OR the day is from the next year
      if ((date.month() > currentMonth && date.year() >= from.year()) || date.year() >= to.year()) {
        dayElement = '<td class="next-month">' + day + '</td>';
      }

      $tr.append(dayElement);
      date.add(1, 'days');
    };

    if (date.month() > currentMonth ||
      date.month() < currentMonth && date.year() < to.year()) {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
      }

      insertPicture(currentMonth);
      insertCalendar(currentMonth);

      // if Monday is not 1st, we are going to show the last days of the
      // last month
      var temp = moment(date);
      temp.subtract(7, 'days');

      if (date.day() !== 1 || date.format('DD') != "01") {
        date.subtract(7, 'days');
      }
    }
  }
}
