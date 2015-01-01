function toInches(number) {
  return Number(number / 25.4).toPrecision(2);
}


$(function() {
  var date = moment().date(1).month(0);
  var year = moment(date).year();
  // sizes in mm
  var pageSizes = {
    'a4': {
      width: 210,
      height: 297,
      marginTop: 17,
      marginBottom: 25.4,
      marginLeft: 17,
      marginRight: 17
    },
    'a3': {
      width: 297,
      height: 420,
      marginTop: 17,
      marginBottom: 25.4,
      marginLeft: 17,
      marginRight: 17
    },
    'letter': {
      width: 215.9,
      height: 279.4,
      marginTop: 17,
      marginBottom: 25.4,
      marginLeft: 17,
      marginRight: 17
    }
  };

  $('.fromPeriod').val(moment(date).year(++year).format('YYYY-MM-DD'));
  $('.toPeriod').val(moment(date).year(++year).format('YYYY-MM-DD'));

  $('.widthUnit').change(function(event) {
    $('.units').text($('.widthUnit').val());
    $('.pageSize').change();
  });

  $('.widthUnit').change();

  $('.pageSize').change(function(event) {
    if ($('.pageSize').val() === 'custom') {
      $('.customPageSize').show();
    } else {
      $('.customPageSize').hide();
      var pageSize = pageSizes[$('.pageSize').val()];
      var isMm = $('.widthUnit').val() === 'mm';
      $('.pageMarginTop').val(isMm ? pageSize.marginTop : toInches(pageSize.marginTop));
      $('.pageMarginBottom').val(isMm ? pageSize.marginBottom : toInches(pageSize.marginBottom));
      $('.pageMarginLeft').val(isMm ? pageSize.marginLeft : toInches(pageSize.marginLeft));
      $('.pageMarginRight').val(isMm ? pageSize.marginRight : toInches(pageSize.marginRight));
    }
  });

  $('.printCalendar').click(function(event) {
    event.preventDefault();
    var pictureSeparate = $('.pictureSeparate').prop('checked');
    var pageWidth;
    var pageHeight;
    var unit = $('.widthUnit').val();
    var pageMarginTop = $('.pageMarginTop').val();
    var pageMarginBottom = $('.pageMarginBottom').val();
    var pageMarginLeft = $('.pageMarginLeft').val();
    var pageMarginRight = $('.pageMarginRight').val();

    if ($('.pageSize').val() === 'custom') {
      // when the picture is separate, we want to print in landscape
      // so the width it's the height and the height the width
      if (pictureSeparate) {
        pageWidth = $('.pageWidth').val() - pageMarginLeft - pageMarginRight;
        pageHeight = ($('.pageHeight').val() * 2) - pageMarginTop - pageMarginBottom;
      } else {
        pageWidth = $('.pageHeight').val() - pageMarginLeft - pageMarginRight;
        pageHeight = $('.pageWidth').val() - pageMarginTop - pageMarginBottom;
      }

      less.modifyVars({
        '@pageSizeUnit': unit,
        '@pageWidth': pageWidth + unit,
        '@pageHeight': pageHeight + unit,
        '@pageSize': '@pageWidt @pageHeight',
        '@pageOrientation': pictureSeparate ? 'landscape' : 'portrait',
      });
    } else {
      var selectedSize = $('.pageSize').val();
      var pageSize = pageSizes[selectedSize];

      // when the picture is separate, we want to print in landscape
      // so the width it's the height and the height the width
      if (pictureSeparate) {
        // convert mm to in if necessary
        pageWidth = unit === 'mm' ? pageSize.height : toInches(pageSize.height);
        pageHeight = unit === 'mm' ? pageSize.width : toInches(pageSize.width);
        pageHeight *= 2;
        pageHeight = pageHeight - pageMarginTop - pageMarginBottom;
      } else {
        // convert mm to in if necessary
        pageWidth = unit === 'mm' ? pageSize.width : pageSize.width / 25.4;
        pageHeight = unit === 'mm' ? pageSize.height : pageSize.height / 25.4;
      }
      pageWidth = pageWidth - pageMarginLeft - pageMarginRight;
      pageHeight = pageHeight - pageMarginTop - pageMarginBottom - 1;

      less.modifyVars({
        '@pageSizeUnit': unit,
        '@pageWidth': pageWidth + unit,
        '@pageHeight': pageHeight + unit,
        '@pageSize': selectedSize,
        '@pageOrientation': pictureSeparate ? 'landscape' : 'portrait',
      });
    }

    $('body').toggleClass('pictureSeparate', pictureSeparate);
    $('body').toggleClass('pageBorder', $('.showPageBorder').prop('checked'));
    $('body').toggleClass('noPictures', $('.noPictures').prop('checked'));

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

  var createPageForMonthNumber = function(month) {
    var $container = $('<div class="page"></div>').appendTo('.printableCalendar');

    insertPicture(month, $container);
    insertCalendar(month, $container);
  }

  var insertPicture = function(month, $container) {
    $('<div class="imgContainer"><img src="photos/1/' + (month + 1) + '.jpg" /></div>').appendTo($container);
  };

  var insertCalendar = function(month, $container) {
    var $Calendar = $('<div class="Calendar"></div>').appendTo($container);

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

  // January
  createPageForMonthNumber(0);

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

      createPageForMonthNumber(currentMonth);

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
