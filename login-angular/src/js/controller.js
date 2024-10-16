angular.module('loginApp', [])
  .controller('LoginController', ['$http', '$window', function ($http, $window) {
    let vm = this;

    // Đối tượng chứa thông tin của người dùng
    vm.user = {
      name: '',
      email: '',
      password: ''
    };

    // Hàm đăng ký (onSignUp)
    vm.onSignUp = function () {
      if (vm.user.name && vm.user.email && vm.user.password) {
        $http.post('http://localhost:5000/api/users/register', vm.user)
          .then(function (response) {
            console.log('User registered successfully:', response.data);
            alert('Signup successful! Please log in.');
            vm.user = {
                name: '',
                email: '',
                password: ''
              };
          })
          .catch(function (error) {
            console.error('Signup error:', error);
            alert('Signup failed! Please try again.');
          });
      } else {
        alert('Please fill out all the fields!');
      }
    };

    // Hàm đăng nhập (onLogIn)
    vm.onLogIn = function () {
      if (vm.user.email && vm.user.password) {
        $http.post('http://localhost:5000/api/users/login', {
          email: vm.user.email,
          password: vm.user.password
        })
        .then(function (response) {
          console.log('Login successful:', response.data);

          // Lưu token vào localStorage
          $window.localStorage.setItem('token', response.data.accessToken);
          alert('Login successful!');
        })
        .catch(function (error) {
          console.error('Login error:', error);
          alert('Login failed! Check your email and password.');
        });
      } else {
        alert('Please enter email and password!');
      }
    };

  }]);
