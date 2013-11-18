/*
 * GET /
 */

exports.index = function(req, res){
  res.render('home/index',
    {
      title: 'Express',
      heading: 'Home',
      user: res.locals.user ? res.locals.user : null
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
      heading: 'Login',
      signup: req.query.signup
    }
  );
};