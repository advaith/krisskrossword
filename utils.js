function getDaysInMonth(month, year) {
     var date = new Date(year, month, 1);
     var days = [];
     while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
     }
     return days;
}

function yyyymmdd(date_obj) {
  var mm = date_obj.getMonth() + 1; // getMonth() is zero-based
  var dd = date_obj.getDate();

  return [date_obj.getFullYear(), '/',
          (mm>9 ? '' : '0') + mm, '/',
          (dd>9 ? '' : '0') + dd
         ].join('');
};

function generate_all_urls(type) {
	// Type can be either "daily" or "mini"
	console.log("generate_all_urls | beginning")
	var base_url = 'https://www.nytimes.com/crosswords/game/' + type + '/'
	var current_yr = 1993;
	var current_mm = 0;
	var stop_year = 2019;
	var stop_month = 12;
	var days = []
	var day_strs = []

	var today = new Date();
	var today_mm = today.getMonth();
	var today_yr = today.getFullYear();

	while (current_yr <= stop_year) {
		while (current_mm < stop_month) {
			if ((current_mm > today_mm) && (current_yr >= today_yr)) {
				break;
			}
			new_days = getDaysInMonth(current_mm, current_yr)
			days = days.concat(new_days);
			current_mm += 1
		}
		current_mm = 0
		current_yr += 1
	}

	days.forEach(function(day_obj) {
		day_strs.push(base_url + yyyymmdd(day_obj));
	});



	return day_strs;
}

function timeStringToFloat(time) {
  var minutesSeconds = time.split(/[.:]/);
  if (minutesSeconds.length == 2) {
    var minutes = parseInt(minutesSeconds[0], 10);
    var seconds = minutesSeconds[1] ? parseInt(minutesSeconds[1], 10) : 0;
    return minutes + seconds / 60;
  } else {
    var hours = parseInt(minutesSeconds[0])
    var minutes = parseInt(minutesSeconds[1], 10)
    var seconds = minutesSeconds[1] ? parseInt(minutesSeconds[1], 10) : 0;
    return hours*60 + minutes + seconds/60;
  }
  
}

function timeFloatToString(time) {
  var minutes = Math.floor(time)
  var seconds = Math.round((time - minutes)*60)
  console.log("timeFloatToString | minutes seconds", minutes, seconds)
  return minutes.toString() + ":" + (seconds < 10 ? '0': '') + seconds.toString();
}

function dict_to_table(scoreDict, checkDict) {
  var html = '<table style="width:100%" class="friend_score_table">'
  html += '<thead>'
  html += '<tr><th>Name</th>'
  html += '<th>Time</th>' 
  html += '<th>Checks?</th>'
  html += '</tr></thead><tbody>'

  for(var uid in scoreDict) {
    html += '<tr>'
    var score = scoreDict[uid]
    var check = checkDict[uid]
    var uid_len = uid.length
    var name = uid.slice(0, uid_len-10)
    html += '<td>' + name + '</td>'
    html += '<td>' + score + '</td>'
    if (check == 0) {
      html += '<td> no </td>'
    } else {
      html += '<td> yes </td>'
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}
