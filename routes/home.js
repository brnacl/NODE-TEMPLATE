/*
 * GET /
 */

exports.index = function(req, res){
  console.log('home.index');
  res.render('home/index',
    {
      title: 'Express',
      heading: 'Home',
      userName: res.locals.user ? res.locals.user.email : null
    }
  );
};

/*
 * GET /register
 */

exports.register = function(req, res){
  res.render('home/register',
    {
      title: 'Sign-Up',
      heading: 'Sign-Up'
    }
  );
};

/*
 * GET /login
 */

exports.login = function(req, res){
  res.render('home/login',
    {
      title: 'Login',
      heading: 'Login'
    }
  );
};