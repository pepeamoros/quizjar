var path = require('path');

// Postgres DATABASE_URL = postgres://user:passwd@host:port/database
// SQLite   DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd, 
  { dialect:  protocol,
    protocol: protocol,
    port:     port,
    host:     host,
    storage:  storage,  // solo SQLite (.env)
    omitNull: true      // solo Postgres
  }      
);

// Importar definicion de la tabla Quiz
var quiz_path = path.join(__dirname,'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar definicion de la tabla Comment
var comment_path = path.join(__dirname,'comment');
var Comment = sequelize.import(comment_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; // exportar tabla Quiz
exports.Comment = Comment;

// sequelize.sync() inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  Quiz.count().then(function (count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      Quiz.bulkCreate( 
        [         
        {tema:'humanidades', pregunta:'Capital de Alemania', respuesta:'Berlín'},
        {tema:'humanidades', pregunta:'Capital de Italia', respuesta:'Roma'},
        {tema:'humanidades', pregunta:'Capital de Portugal', respuesta:'Lisboa'},        
        {tema:'tecnologia', pregunta:'Capital de España', respuesta:'Madrid'},
        {tema:'tecnologia', pregunta:'Capital de Francia', respuesta:'París'},
        {tema:'ciencia', pregunta:'Capital de Grecia', respuesta:'Atenas'},
        {tema:'ciencia', pregunta:'Capital de Reino Unido', respuesta:'Londres'},
        {tema:'ocio', pregunta:'Donde juega Messi', respuesta:'Barcelona'},
        {tema:'ocio', pregunta:'Piloto de McLaren-Honda', respuesta:'Alonso'},
        {tema:'otro', pregunta:'Capital de Rusia', respuesta:'Moscú'}
        ]
      ).then(function(){console.log('Base de datos inicializada')});
    };
  });
});