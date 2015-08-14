var models = require('../models/models.js');

/*
// Array de de opciones para tema
var arrayTemas = {
  otro:         "Otro", 
  humanidades:  "Humanidades", 
  ocio:         "Ocio",
  ciencia:      "Ciencia",
  tecnologia:   "tecnologia"
};
*/


// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
            where: {
                id: Number(quizId)
            },
            include: [{
                model: models.Comment
            }]
        }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{next(new Error('No existe quizId=' + quizId))}
    }
  ).catch(function(error){next(error)});
};

// GET /quizes
// Si hay un parametro search:
// Remplaza el principio del string, los espacios, y el fin del string con % 
// y lo guarda en la variable search
// con la opcion "order:" ordena las preguntas filtradas

exports.index = function(req, res){
  if(req.query.search) { // texto seleccionado
    var filtro = (req.query.search || '').replace(" ", "%");
    models.Quiz.findAll({where:["pregunta like ?", '%'+filtro+'%'],order:'pregunta ASC'}).then(function(quizes){
    res.render('quizes/index', {quizes: quizes, errors: []});
    }).catch(function(error) { next(error);});

  } else {     // tematica seleccionada
    if(req.query.tema) {
      var filtro = (req.query.tema || '');
      models.Quiz.findAll({where:["tema like ?", '%'+filtro+'%'],order:'tema ASC'}).then(function(quizes){
      res.render('quizes/index', {quizes: quizes, errors: []});
      }).catch(function(error) { next(error);});
    } else {    // nada seleccionado
      models.Quiz.findAll({order:'tema ASC'}).then(function(quizes){
      res.render('quizes/index', {quizes: quizes, errors: []});
      }).catch(function(error) { next(error);});
    }       
  }
};


// GET /quizes/:id
exports.show = function(req, res) {
  res.render('quizes/show', { quiz: req.quiz, errors: []});
};            // req.quiz: instancia de quiz cargada con autoload

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, 
      respuesta: resultado, 
      errors: []
    }
  );
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( // crea objeto quiz 
    {tema: "tema", pregunta: "Pregunta", respuesta: "Respuesta"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["tema", "pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes')}) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz;  // req.quiz: autoload de instancia de quiz

  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  req.quiz.tema  = req.body.quiz.tema;
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["tema", "pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

// GET author
exports.author = function(req, res){
 res.render ('author', {autor: 'José Amoros Rico', errors: []});
};

//  console.log("req.quiz.id: " + req.quiz.id);