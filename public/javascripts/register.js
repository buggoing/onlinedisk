
$('#username_input').on('change', function(){
	var username = document.getElementById('username_input');
	var blob = new Blob([username.value]);
	console.log(blob.size);

	if (blob.size > 32){
		message = document.getElementById('message');
		message.innerHTML= '用户名太长';
		username.value = '';
	}
	
});
/*

$('#password_input').on('change', function(){
	var password = document.getElementById('password_input');
	var blob = new Blob([password.value]);
	console.log(blob.size);

	if (blob.size > 32){
		message = document.getElementById('message');
		message.innerHTML= '用户名太长';
		password.value = '';
	}

}
*/


$('#btn_submit').click(function(event){
	event.preventDefault();
	message = document.getElementById('message');
	if (document.getElementById('username_input').value ===''){
		message.innerHTML = '请填写用户名';
		return;
	}
	var password = document.getElementById('password_input');
	var password_repeat = document.getElementById('password_input_repeat');

	if (password.value != password_repeat.value){
		
		message.innerHTML= '密码不一致';
		password.value = '';
		password_repeat.value = '';
		return;
	}
	$('#register_form').submit();
});