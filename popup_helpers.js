
function show_tab(tab_name) {
	all_tabs = ['you_tab', 'friend_tab', 'world_tab']
	all_tabs.forEach(function(el_name) {
		content = document.getElementById(el_name + "_content");
		tab = document.getElementById(el_name);
		if (el_name == tab_name) {
			content.style.display = "block";
			tab.style.border = "1px solid grey";
		} else {
			content.style.display = "none";
			tab.style.border = "1px solid transparent";
		}
	})
}


you_tab = document.getElementById('you_tab')
friend_tab = document.getElementById('friend_tab')
world_tab = document.getElementById('world_tab')


you_tab.onclick = function() {show_tab('you_tab')};
friend_tab.onclick = function () {show_tab('friend_tab')};
world_tab.onclick = function () {show_tab('world_tab')};

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
	var stop_month = 11;
	var days = []
	var day_strs = []

	var today = new Date();
	var today_mm = today.getMonth();
	var today_yr = today.getFullYear();

	// for debugging purposes
	var today_mm = 6;
	var today_yr = 2018;

	while (current_yr <= stop_year) {
		while (current_mm <= stop_month) {
			if ((current_mm > today_mm) && (current_yr == today_yr)) {
				break;
			}
			new_days = getDaysInMonth(current_mm, current_yr)
			days = days.concat(new_days);
			current_mm += 1
		}
		current_mm = 1
		current_yr += 1
	}

	days.forEach(function(day_obj) {
		day_strs.push(base_url + yyyymmdd(day_obj));
	});



	return day_strs;

}

