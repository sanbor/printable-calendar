// add delay to the keyup event, borrowed from http://stackoverflow.com/questions/1909441/jquery-keyup-delay
var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

var holidays = ['01-01', '02-16', '02-17', '03-23', '03-24', '04-02', '04-03', '05-01', '05-25', '06-20', '07-09', '08-17', '10-12', '11-23', '12-07', '12-08', '12-25'];

// optimization: maybe it would be a better idea to create image nodes and store a reference to the node
var pictures = ['photos/1/1.jpg', 'photos/1/2.jpg', 'photos/1/3.jpg', 'photos/1/4.jpg', 'photos/1/5.jpg', 'photos/1/6.jpg', 'photos/1/7.jpg', 'photos/1/8.jpg', 'photos/1/9.jpg', 'photos/1/10.jpg', 'photos/1/11.jpg', 'photos/1/12.jpg'];

// sizes in mm
var PAPER_SIZES = {
  'a4': {
    width: 210,
    height: 297,
    marginTop: 17,
    marginBottom: 17,
    marginLeft: 17,
    marginRight: 17
  },
  'a3': {
    width: 297,
    height: 420,
    marginTop: 17,
    marginBottom: 17,
    marginLeft: 17,
    marginRight: 17
  },
  'letter': {
    width: 215.9,
    height: 279.4,
    marginTop: 17,
    marginBottom: 17,
    marginLeft: 17,
    marginRight: 17
  }
};

$(function() {
  populateYearsDropdown();
  addFormEvents();
  addCalendarEvents();

  updatePaperFormControls();

  // Shows the preview
  updateCalendar();
});

function populateYearsDropdown() {
  var year = moment().year();

  for (var i = year; i < (year + 10); i++) {
    $('.year').append('<option>' + i + '</option');
  };

  // checks if it's time to print next year calendar
  if (moment().month() > 10) {
    $('.year option:nth-child(2)').prop('selected', true);
  }
}

function isNumber(n) {
  return typeof n == 'number' && !isNaN(n) && isFinite(n);
}

function areSizesValid() {
  var isValid = true;

  $('input').each(function() {
    var value = Number($(this).val());
    if (!isNumber(value)) {
      isValid = false;
    }
  });

  return isValid;
};

function updateCalendar() {
  if (!areSizesValid()) {
    return;
  }

  updatePaperSettings();
  generateCalendar($('.year').val());
}

function addFormEvents() {
  $('.printCalendar').click(printCalendar);
  $('.widthUnit').change(updatePaperFormControls);
  $('.paperSize').change(updatePaperFormControls);
  $('select').change(updateCalendar);
  $('.tab-content input')
    .on('keyup', function() {
      delay(function() {
        updatePaperSettings();
        generateCalendar($('.year').val());
      }, 400);
    });
}

var dragSrcEl_ = null;

function addCalendarEvents() {
  $('.printableCalendar').on('click', '.Calendar-table td', function(event) {
    var holidayDate = $(event.currentTarget).data('date');
    var existingHoliday = holidays.indexOf(holidayDate);

    if (existingHoliday < 0) {
      if (!$(event.currentTarget).hasClass('prev-month')) {
        holidays.push(holidayDate);
        $('.Calendar-table td[data-date=' + holidayDate + ']').addClass('holiday');
      }
    } else {
      holidays.splice(existingHoliday, 1);
      $('.Calendar-table td[data-date=' + holidayDate + ']').removeClass('holiday');
    }
  });

  $('.printableCalendar').on('dragstart', '.imgContainer', function(event) {
    event.originalEvent.dataTransfer.effectAllowed = 'move';
    event.originalEvent.dataTransfer.setData('text/html', this.innerHTML);
    dragSrcEl_ = this;
    $(event.currentTarget).css({
      'border': 'dashed 2px blue'
    });
  });

  $('.printableCalendar').on('dragover', '.imgContainer', function(event) {
    event.preventDefault();
    $(event.currentTarget).css({
      'border': 'dashed 2px blue'
    });
  });

  $('.printableCalendar').on('dragend', '.imgContainer', function(event) {
    event.preventDefault();
    $(event.currentTarget).css({
      'border': 'none'
    });
  });

  $('.printableCalendar').on('drop', '.imgContainer', function(event) {
    event.preventDefault();
    console.log(event.originalEvent.dataTransfer.files.length);
    if (event.originalEvent.dataTransfer.files.length === 0) {
      // Don't do anything if we're dropping on the same column we're dragging.
      if (dragSrcEl_ != this) {
        dragSrcEl_.innerHTML = this.innerHTML;
        this.innerHTML = event.originalEvent.dataTransfer.getData('text/html');
      }
    } else {
      readfiles(event.originalEvent.dataTransfer.files, $(event.currentTarget));
    }
    $('.imgContainer').css({
      'border': 'none'
    });
  });
}

var tests = {
  filereader: typeof FileReader != 'undefined',
  dnd: 'draggable' in document.createElement('span'),
  formdata: !!window.FormData,
};

var acceptedTypes = {
  'image/png': true,
  'image/jpeg': true,
  'image/gif': true
};

function showfile(file, $imageContainer, containerIndex) {
  if (tests.filereader === true && acceptedTypes[file.type] === true) {
    var reader = new FileReader();
    reader.onload = function(event) {
      var image = new Image();
      image.src = event.target.result;
      $imageContainer.empty();
      $imageContainer.append(image);
      pictures[containerIndex] = image.src;
    };

    reader.readAsDataURL(file);
    return true;
  } else {
    return false;
  }
}

function readfiles(files, $imageContainer) {
  var containerIndex = $('.imgContainer').index($imageContainer);

  for (var i = 0; i < files.length; i++) {
    // if (tests.formdata) formData.append('file', files[i]);
    var shown = showfile(files[i], $('.imgContainer:eq(' + containerIndex + ')'), containerIndex);
    if (shown) {
      containerIndex++;
    }
  }
}

function toMm(number, unit) {
  var n = Number(number);

  return unit == 'mm' ? n : (n * 25.4).toPrecision(2);
}

function toInches(number) {
  var n = Number(number);

  return (n / 25.4).toPrecision(2);
}

function updatePaperSettings() {
  var unit = $('.widthUnit').val();
  var selectedSize;
  var paperWidth;
  var paperHeight;
  var paperMarginTop = $('.paperMarginTop').val();
  var paperMarginBottom = $('.paperMarginBottom').val();
  var paperMarginLeft = $('.paperMarginLeft').val();
  var paperMarginRight = $('.paperMarginRight').val();

  if ($('.paperSize').val() === 'custom') {
    selectedSize = '';
    paperWidth = toMm($('.paperWidth').val(), unit);
    paperHeight = toMm($('.paperHeight').val(), unit);

  } else {
    selectedSize = $('.paperSize').val();
    selectedPaper = PAPER_SIZES[selectedSize];
    paperWidth = selectedPaper.width;
    paperHeight = selectedPaper.height;
  }

  less.modifyVars({
    '@paperSizeUnit': unit,
    '@paperWidth': paperWidth + 'mm',
    '@paperHeight': paperHeight + 'mm',
    '@paperMarginTop': toMm(paperMarginTop, unit) + 'mm',
    '@paperMarginBottom': toMm(paperMarginBottom, unit) + 'mm',
    '@paperMarginLeft': toMm(paperMarginLeft, unit) + 'mm',
    '@paperMarginRight': toMm(paperMarginRight, unit) + 'mm',
    '@paperSize': selectedSize,
    '@paperOrientation': 'portrait',
  });
}

function printCalendar(event) {
  updatePaperSettings();
  window.print();
  event.preventDefault();
};

function updatePaperFormControls() {
  $('.units').text($('.widthUnit').val());

  if ($('.paperSize').val() === 'custom') {
    $('.custompaperSize').show();
  } else {
    $('.custompaperSize').hide();
    var paperSize = PAPER_SIZES[$('.paperSize').val()];
    var isMm = $('.widthUnit').val() === 'mm';
    $('.paperMarginTop').val(isMm ? paperSize.marginTop : toInches(paperSize.marginTop));
    $('.paperMarginBottom').val(isMm ? paperSize.marginBottom : toInches(paperSize.marginBottom));
    $('.paperMarginLeft').val(isMm ? paperSize.marginLeft : toInches(paperSize.marginLeft));
    $('.paperMarginRight').val(isMm ? paperSize.marginRight : toInches(paperSize.marginRight));
  }
};

function generateCalendar(year) {
  // clean previous calendar
  $('.printableCalendar').empty();

  // Spanish days
  moment.locale('es');
  var startOnModay = true;
  var from = moment(year + '-01-01');
  var to = moment((parseInt(year, 10) + 1) + '-01-01');

  var months = moment.months();
  var currentMonth = 0;
  var week = 1;
  var $table;

  // First week of the year (starts in Dec 28 2014 instead Jan 1 2015)
  var date = moment(from)

  if (startOnModay) {
    // start the week on Monday
    date.day(1);
  } else {
    // start the week on Sunday
    date.day(0);
  }

  var createpaperForMonthNumber = function(month) {
    var $container = $('<div class="paper"></div>').appendTo('.printableCalendar');

    insertPicture(month, $container);
    insertCalendar(month, $container);
  }

  var insertPicture = function(month, $container) {
    $('<div class="imgContainer" draggable="true"><img src="' + pictures[month] + '" /></div>').appendTo($container);
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
  createpaperForMonthNumber(0);

  while (date.isBefore(to)) {
    var $tr = $('<tr/>').appendTo($table);

    for (var i = 0; i < 7; i++) {
      var day = date.format('DD');
      var dataDate = 'data-date="' + date.format('MM-DD') + '"';

      var dayElement = $('<td ' + dataDate + '>' + day + '</td>');

      if (holidays.indexOf(date.format('MM-DD')) >= 0) {
        dayElement.addClass('holiday');
      }
      // Checks if the current day is from last month OR last year
      // BUG: doesn't work in January with calendars longer than a year
      if (date.month() < currentMonth || date.year() < from.year()) {
        dayElement.addClass('prev-month');
      }
      // Checks if the current day is from the next month and this year
      // OR the day is from the next year
      if ((date.month() > currentMonth && date.year() >= from.year()) || date.year() >= to.year()) {
        dayElement.addClass('prev-next-month');
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

      createpaperForMonthNumber(currentMonth);

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
