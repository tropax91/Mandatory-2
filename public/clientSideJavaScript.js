
$(document).ready(function () {

    $("#btn1").click(function (e) {

        e.preventDefault();

        var fullname = $("#fullname").val();
        var email = $("#email").val();
        var password = $("#password").val();
        var username = $("#username").val();
        

        if (fullname == "" || email == "" || password == "" || username == "") {

            $('#valid').empty();
            $('#notValid').html('Please fill out all fields!');
        } 
        if(username.length < 3) {
            $('#notValid').html('Username must be at least 3 chars!');

        }       
        else {

            let data = {
                fullname: fullname,
                email: email,
                password: password,
                username: username

            };
            console.log("The data: " + data);


            $.ajax({
                type: 'POST',
                url: 'register',
                data: data,
                success: function (response) {
                    console.log(response.username + response.password + response.fullname + response.email);
                    document.location.href = "http://localhost:3000/login";


                }
            });

            $("#valid").html("✔ User Registered! ")
            $('#notValid').empty();

            

        }

    });

    $('#loginButton').click(function (event) {

        var username = $("#username").val();
        var password = $("#password").val();

        if (username == "" || password == "" ) {
            $('#valid').empty();
            $('#notValid').html('Please enter username and password');
        }

        var loginData = { "username": username, "password": password };

        $.ajax({
            type: "POST",
            url: '/login',
            data: loginData,
            success: function (data) {
                //it navigates to localhost:3000/chat if the ajax request was a success(if username and password was correct on the client side)
                console.log("Success!");
                document.location.href = "http://localhost:3000/chat";

            }
        });



    });
});


