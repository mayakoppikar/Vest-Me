
// declarations
var express         = require("express"),
    app             = express(),
	methodOverride  = require('method-override'),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    passport        = require("passport"),
	expressSanitizer = require("express-sanitizer"),
    Question        = require("./models/question"),
	Scenario        = require("./models/scenario"),
    LocalStrategy   = require("passport-local"),
	Investment      = require("./models/investment"),
    flash           = require("connect-flash"),
    User            = require("./models/user"),
	emailExistence = require("email-existence"),
    session         = require("express-session");

const cheerio = require('cheerio');
const request = require('request');


//time held investment


 
// // assign mongoose promise library and connect to database
// mongoosePromise = global.Promise;

// // setting variables up and other fun stuff
// mongoose.connect('mongodb://localhost:27017/dbVestMe', {
//  	 useNewUrlParser: true,
//  	 useUnifiedTopology: true
// })
// .then(() => console.log('Connected to DB!'))
// .catch(error => console.log(error.message));
// mongoose.Promise = global.Promise;









mongoose.connect("mongodb+srv://maya:maya@cluster0.i9ses.mongodb.net/<dbname>?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
})
.then(() => {
	console.log("CONNECTED TO DB")
}).catch(err => {
console.log(err.message);
});













app.use('/public', express.static('public'));
app.use(flash());
app.set("view engine", "ejs");
//PASSPORT CONFIG
app.use(require('serve-static')(__dirname + '/../../public'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(methodOverride('_method'));
app.use(expressSanitizer());


app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	const b = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});


function isLoggedIn(req,res,next){
if(req.isAuthenticated()){
return next();
	
   }	
	req.flash("error", "Please login first...");
	res.redirect("/login");
}

setInterval(function(){
	
	
	function sendemail(toemail, invticker, buyprice, invsellidealprice, price){
	const nodemailer = require("nodemailer");
require("dotenv").config();
	
	
	var capappreciation = price - buyprice;

let transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.PASSWORD,
		pass: process.env.EMAIL
	}
	
});

let mailOptions = {
	from: 'vestmetesting@gmail.com',
	to: toemail,
	subject: 'Price Alert!',
	text: 'Hello, it may be time to sell your investment! Your investment, ' + invticker + ' has passed/reached the value of $' + invsellidealprice + '. By selling now, you will have reached a capital appreciation of $' + capappreciation +  '. If you want to hold onto your investment and sell at a later time and wish to be sent an emailed price alert, please visit your scenario page, adn edit the email notification tab. Thank you and happy investing!',
	html: '<p>Hello!</p><p>It may be time to sell your investment! Your investment, <strong>' + invticker + '</strong> has passed/reached the value of $<strong>' + invsellidealprice + '</strong> By selling now, you will have reached a capital appreciation of <strong>$' + capappreciation + '</strong>.</p><p>If you would like to hold onto your investment and wish to be sent an emailed price alert again, please visit your scenario page, and edit the email notification tab with your new price alert value.</p> <p>Thank you and happy investing!</p><p>Sincerely, Vest Me</p>'
};


transporter.sendMail(mailOptions, function(err, data){
	if(err){
console.log(err);
	}
	else{
console.log("Email sent!");
	
	}
});
}

	
Investment.find({}, function(err, v){

if(err){
console.log(err);
}
	
	else{

		
		for(var i = 0; i < v.length; i++){
			
			if((!(v[i].emailormanual === "M")) && (!(v[i].emailormanual === "E"))){
				
	var sellidealprice = v[i].emailormanual;
	var ticker = v[i].ticker;
	var emailsend = v[i].useremail;
	var invid = v[i].id;
	var buyprice = v[i].initialprice;
				
				
				
						var rp = require("request-promise");

var options = {
    uri: 'https://finance.yahoo.com/quote/' + ticker + '?p=' + ticker,
    transform: function (body) {
        return cheerio.load(body);
    }
};
				
				
				
				
				rp(options)
	.then(function($){
	
	var price =  $('span[class="Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)"]').text().toString();
					
					if(sellidealprice > price){
		sendemail(emailsend, ticker, buyprice, sellidealprice, price);				
						
						Investment.findByIdAndUpdate(invid, {emailormanual: "E"}, function(err, vnew){

							if(err){
								console.log(err);
							}
							else{
								console.log(vnew);
							}
						
						
						});
						
					}
					
				});
	
				
				
			}

		}
		
	}
})	
}, 1000);



// setting up routes

// index route
app.get("/", function(req, res){
	res.render("index.ejs");
});


app.get("/main", function(req, res){
	res.render("indexmain.ejs");
});


// about page route
app.get("/about", function(req, res){
	res.render("about.ejs");
});

//learn page route

// //learn get route(main)
app.get("/learn", function(req, res){
	Question.find({}, function(err, allquestions){
		if(err){
			console.log(err);
		} 
		else {
			res.render("learn.ejs", {questions: allquestions});
		}
	});
});

// learn post route 
app.post("/learn", function(req, res){
	var userQuest = req.body.question;
	var useQuest = {question: userQuest};
	
	console.log(useQuest);
	
	
	req.body.question.body = req.sanitize(req.body.question.body);
	
	Question.create(useQuest, function(err, newquest){
		
		if(err){
			console.log(err);
		}
		else{
			req.flash("success", "Yay! Question successfully added!" );
			res.redirect("/learn");
		}
	});
});

//learn get new(form)
app.get("/learn/new", function(req, res){
	res.render("newquestion.ejs");
});

//end of learn

//login route 
app.get("/login", function(req, res){
	res.render("login.ejs");
});

//mainpage route
app.get("/mainpage",isLoggedIn, function(req,res){
	console.log(req.user);
	var user = req.user;
	
	var investments = req.invester;
	
	
		Scenario.find({user : {id: user._id, username: user.username}} , function(err, allscenarios){
	if(err){
		console.log(err);
	}
	else{
		// Investment.find({scenario: {id: allscenarios._id}}, function(err, v){
			
		// });
		console.log(allscenarios);
		
		res.render("mainpage.ejs", {currentUser: req.user, scenario: allscenarios});
		
		
	
	}
});
	
});


//Auth routes

//register route
app.get("/register", function(req, res){
	res.render("register.ejs");
});

app.post("/register", function(req, res){
	var confirmpass = req.body.confirmpass;
	var pass= req.body.password;
	var avatar = req.body.avatar;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var email = req.body.email;
	
emailExistence.check(email, function(error, response){
       if(response){
		   var newUser = new User({username: req.body.username, firstname: firstname, lastname: lastname, password:pass, confirmpass: confirmpass, email: email, avatar: avatar});
	
	
	
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		
		else if(confirmpass === pass){
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Signed you up! Nice to meet you " + req.body.username + "!");
				res.redirect("/mainpage");	
		});
		}
		else{
				return res.render("register.ejs");
		}
	});
	   }
	else{
req.flash("error", "The email you entered does not exist...");
		res.redirect("/register");
	}
    });
	
	
	
});






//login information here

//show login form

app.get("/login", function(req, res){
	res.render("login.ejs");
});

app.post("/login", passport.authenticate("local", 
					{successRedirect: "mainpage"  , failureRedirect: "/login" }) , 
	function(req, res){
	 		
});



app.get("/logout", isLoggedIn, function(req,res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/main");
});


//scenarios routes
app.get("/scenario", isLoggedIn, function(req, res){

Scenario.find({}, function(err, scenarios){
		if(err){
			console.log(err);
}
		else{
			res.render("newscenario.ejs", {scenarios: scenarios});	
		}
	});
});



//scenarios routes


// learn post route 
app.post("/scenario", isLoggedIn, function(req, res){
	
	var startval = req.body.startingvalue;
	var goalval = req.body.goalvalue;
	var enddate = req.body.idealenddate;
	var currentDate = Date(Date.now()).toLocaleString();
	var title= req.body.title;
	var user = {
		id: req.user._id,
		username: req.user.username
	}
	
	var newScenario = {title: title, startval: startval, goalval: goalval, enddate: enddate, createdOn: currentDate, currentVal: startval, user: user};
	
	
	
	console.log(req.user);
	
	Scenario.create(newScenario, function(err, scenario){
		if(err){
			console.log(err);
		}
		else{
			console.log(scenario);
			req.flash("success", "Yay! Scenario successfully created");
			res.redirect("/mainpage");
		}
	})
	

});



//end of scenarios
//learn get new(form)
app.get("/scenario/new", isLoggedIn, function(req, res){
	res.render("newscenario.ejs");
});

app.get("/scenario/:id", isLoggedIn, function(req,res){
		var user = req.user;
	
	var i = req.params.id;
	
	console.log("ID: " + i);
	
	Scenario.findById(req.params.id, function(err, scenarios){
	if(err){
console.log(err);
	}
	else{
		
		Investment.find({scenario: {id: scenarios._id}}, function(err, v){
			if(err){
				console.log(err);
			}
			else{
				var x = scenarios.createdOn.toString();
				var xn = x.slice(0,15);
				
				var currentdate = new Date().toString();
				 var datetod = currentdate.slice(0,15); 
				
				
			
		res.render("individualscenarios.ejs", {scenario:scenarios, inv: v, cd: xn, datetod: datetod});

			}
		});
	}
});
	

   

	
	
});


app.get("/currentsfunds", function(req, res){

	
	
	var rp = require("request-promise");
	
	
	var optionss = {
    uri: "https://finance.yahoo.com/screener/predefined/top_mutual_funds/",
    transform: function (body) {
        return cheerio.load(body);
    }
};
	
	rp(optionss)
	.then(function($){
		
		let ticker = [];
		let links = [];
		let names = [];
		let changes = [];
		let pchange = [];
		let iprice = [];
$('a[class="Fw(600) C($linkColor)"]').each(function(index, element) {
	ticker[index] = $(element).text();
	links[index] = "https://finance.yahoo.com/quote/" + ticker[index] + "?p=" + ticker[index];
});
		
		
	$('td[aria-label="Name"]').each(function(index, element) {
	names[index] = $(element).text();
});	
		
		
	$('td[aria-label="Change"]').each(function(index, element) {
	changes[index] = $(element).text();
});		
		$('td[aria-label="% Change"]').each(function(index, element) {
	pchange[index] = $(element).text();
});	
			$('td[aria-label="Price (Intraday)"]').each(function(index, element) {
 iprice[index] = $(element).text();
});	
		
		
		

	for(var i = 0; i< ticker.length; i++){
		var o = {
    uri: "https://finance.yahoo.com/quote/" + ticker[i] + "?p=" + ticker[i],
    transform: function (body) {
        return cheerio.load(body);
    }
};	

		
		rp(o)
		.then(function($){
			

			
		})
		.catch(function(err){
			
		});
	
	}
		res.render("investmentsscrape.ejs", {x: ticker, links: links, titles: names, change: changes, pchange: pchange, iprice: iprice});
		
	})
	.catch(function(err){
		
	});

	

});


app.get("/scenario/:id/investments/:ticker/:initval", function(req, res){
	var scenid = req.params.id;
	var ticker = req.params.ticker;
	var initval = req.params.initval;
		var rp = require("request-promise");
	
	
	var optionss = {
    uri: "https://finance.yahoo.com/quote/" + ticker + "?p=" + ticker,
    transform: function (body) {
        return cheerio.load(body);
    }
};
	
	rp(optionss)
	.then(function($){
		
var sellingprice =  $('span[class="Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)"]').text();
		
	Investment.find({ticker: ticker, initialprice: initval}, function(err, v){
	
	if(err){
		console.log(err);
	}
	else{
		
		
		Investment.findByIdAndUpdate(v[0]._id, {soldorcurrent: true, sellingprice: sellingprice}, function(err, vnew){
			if(err){
				console.log(err);
			}
			else{
				console.log(vnew)
Scenario.findById(scenid, function(err, s){
	if(err){
		console.log(err);
	}
	
	
	var cval = s.currentVal + (vnew.numberofshares * sellingprice);
	console.log("CVAL: " + cval);
	Scenario.findByIdAndUpdate(scenid, {currentVal: cval}, function(err, news){
		if(err){
			console.log(err);
		}
		else{
			console.log(news);
					res.redirect("/scenario/" + scenid);

		}
		
	});

	

	
})
			}
			
		});
	}
});
		

		
	})
	.catch(function(err){
		
	});

	

	
});


app.delete("/scenario/:id", function(req, res){

Scenario.findByIdAndRemove(req.params.id, function(err){
	
	if(err){
		console.log(err);
		res.redirect("/mainpage");
	}
	else{
		req.flash("success", "Yay! Scenario successfully deleted");
			res.redirect("/mainpage");
	}
	
});
	
	
});







app.post("/scenario/:id/investments", function(req,res){
	var manualoremail = req.body.emailormanual;
	var x = "manual";
	
	var user = req.user;
	console.log("BFASKBJLKBJFKAJSFBASFKJABSFKJASBFJKASBF" + user);
	
	console.log(manualoremail);
	var moe;
	
	if(manualoremail.length === 2){
		moe = "M";
	}
	else{
		moe = manualoremail;
	}
	console.log("MOE: " + moe);
	
	
	
var rp = require("request-promise");

var options = {
    uri: 'https://finance.yahoo.com/quote/' + req.body.ticker + '?p=' + req.body.ticker,
    transform: function (body) {
        return cheerio.load(body);
    }
};	
	
rp(options)
	.then(function($){
	
	var price =  $('span[class="Trsdu(0.3s) Fw(b) Fz(36px) Mb(-4px) D(ib)"]').text().toString();
	var link = "https://finance.yahoo.com/quote/" + req.body.ticker + "?p=" + req.body.ticker;
	
	Scenario.findById(req.params.id, function(err, scenarioss){
		
		if(err){
			console.log(err);
		}
		else{
var scencurrentvalue = scenarioss.currentVal;
			var pricededuction = req.body.numberofshares * price;
			
			if(scencurrentvalue > pricededuction){
				
				Investment.create({ticker: req.body.ticker, scenario: {id: req.params.id}, numberofshares: req.body.numberofshares, initialprice: price, emailormanual: moe, link:link, soldorcurrent: false, useremail: req.user.email}, function(err, invester){
		if(err){
			console.log(err);
		}
		else{
			console.log(invester);
			Scenario.findById(req.params.id, function(err, s){
				
				if(err){
					console.log(err);
				}
				else{
					
					var newscen = {currentVal: s.currentVal-(invester.numberofshares * invester.initialprice)};
					
					Scenario.findByIdAndUpdate(req.params.id, newscen, function(err, updatescen){
				if(err){
					console.log(err);
				}
				else{
					
					
					Scenario.findById(req.params.id,  function(err, scen){
		if(err){
			console.log(err);
		}
		else{

			var bb = req.body.priceintraday * req.body.numberofshares;
			scen.currentVal = scen.currentVal -  bb;
			
			
						
			req.flash("success", "Yay! Investment successfully created");
			  res.redirect("/mainpage");
		}
	});
					
				}
			});
			
		
	
					
					
					
					
					

				}
			});
			
			
			
			

		}
	});
	
	
		

				
				
			}
			
			else{
				req.flash("error", "Oops! You do not have enough money in your account! Please edit your scenario and add more money, or chnage the parameters for you new investment.");
							  res.redirect("/scenario/" + req.params.id);

				
			}
		}
	});
	
	
	
	
	
	
	
	
  })
    .catch(function (err) {
        // Crawling failed or Cheerio choked...
    });
	
	

	
	

	});
	


// fix edit routes

app.get("/scenario/:id/edit", function(req,res){
			
	Scenario.findById(req.params.id, function(err, fs){
		
		if(err){
			console.log(err);
		}
		else{
			
			res.render("editscenario.ejs", {scenarios: fs});
		}
		
	});
	
	
});

app.get("/scenario/:id/investment/edit/:vestid", function(req,res){
	
	Scenario.findById(req.params.id, function(err, scen){
		if(err){
			console.log(err);
		}
		else{
			Investment.findById(req.params.vestid, function(err, investment){
				
				console.log(investment);
	res.render("alterinvestment.ejs", {scenario: scen, investment: investment});
				
				

			
			})
		}
	});
	
});


app.post("/scenario/:id/investment/edit/:vestid/edit", function(req,res){
	Investment.findByIdAndUpdate(req.params.vestid, {emailormanual: req.body.emailpricealert}, function(err, inew){
		if(err){
			console.log(err);
		}
		else{
			console.log(inew);
			res.redirect("/scenario/" + req.params.id);
		}
	});
	
});



app.put("/scenario/:id", function(req,res){
	
	console.log(req.params.id);
	
	Scenario.findByIdAndUpdate(req.params.id, req.body.scenarios, function(err, updatedScenario){
				if(err){
					console.log(err);
					res.redirect("/mainpage");
				}
		      else{
				  res.redirect("/scenario/" + req.params.id);
			  }

		});
});


//go to individual scenarios main



//setting up server
app.listen(process.env.PORT || 3000, function() { 
  console.log('Server listening on port 3000'); 
});
