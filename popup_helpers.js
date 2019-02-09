
function show_tab(tab_name) {
	all_tabs = ['you_tab', 'friend_tab', 'world_tab']
	console.log(tab_name);
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
console.log(you_tab);
friend_tab.onclick = function () {show_tab('friend_tab')};
world_tab.onclick = function () {show_tab('world_tab')};

