
function show_tab(tab_name) {
	all_tabs = ['you_tab', 'friend_tab', 'world_tab']
	console.log(tab_name);
	all_tabs.forEach(function(el_name) {
		element = document.getElementById(el_name + "_content");
		console.log(element)
		if (el_name == tab_name) {
			element.style.display = "block";
		} else {
			element.style.display = "none";
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


$("#add_friend_text").keyup(function(event) {
    if (event.keyCode === 13) {
    	console.log('lol');
    }
});