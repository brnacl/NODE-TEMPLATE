/*
 * GET /todos
 */

exports.index = function(req, res){
  res.render('todos/index',
    {
      title: 'To Dos',
      heading: 'To-Dos',
      userName: res.locals.user ? res.locals.user.email : null
    }
  );
};
