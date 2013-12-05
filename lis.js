function Env(obj){
    var env = {};
    var outer = obj.outer || {};
    if (obj.parms.length != 0){
        for (var i = 0; i < obj.parms.length; i += 1)
            env[obj.parms[i]] = obj.args[i];
    }
    env.find = function(variable){
        if (variable in env)
            return env;
        else
            return outer.find(variable);
    };
    return env;
}

function add_globals(env){
    // add some Scheme standard procedures to an environment
    env['+'] = function(a, b)  {return a + b;};
    env['-'] = function(a, b)  {return a - b;};
    env['*'] = function(a, b)  {return a * b;};
    env['/'] = function(a, b)  {return a / b;};
    env['>'] = function(a, b)  {return a > b;};
    env['<'] = function(a, b)  {return a < b;};
    env['>='] = function(a, b) {return a >= b;};
    env['<='] = function(a, b) {return a <= b;};
    env['=='] = function(a, b) {return a == b;};
    env['remainder'] = function(a, b) {return a % b;};
    env['equal?'] = function(a, b) {return a == b;};
    env['eq?'] = function(a, b) {return a == b;};
    env['not'] = function(a, b) {return !a;};
    env['length'] = function(a, b) {return a.length;};
    env['cons'] = function(a, b) {return a.concat(b);};
    env['car'] = function(a, b) {return (a.length !== 0) ? a[0] : null;};
    env['cdr'] = function(a, b) {return (a.length > 1) ? a.slice(1) : null;};
    env['append'] = function(a, b) {return a.concat(b);};
    env['list'] = function() {return Array.prototype.slice.call(arguments);};
    env['list?'] = function(a) {return (a instanceof Array);};
    env['null?'] = function(a) {return (a.length == 0);};
    env['symbol?'] = function(a) {return (typeof a == 'string');};
    return env;
}

var global_env = add_globals(Env({parms: [], args: [], outer: undefined}));

// eval..................................................................

function eval(x, env){
    // function to evaluate an expression in an evironment
    env = env || global_env;
    if (typeof x == 'string')
        return env.find(x.valueOf())[x.valueOf()];
    else if (typeof x == 'number')
        return x;
    else if (x[0] == 'quote')
        return x[1];
    else if (x[0] == 'if'){
        var test = x[1];
        var conseq = x[2];
        var alt = x[3];
        if (eval(test, env))
            return eval(conseq, env);
        else
            return eval(alt, env);
    }
    else if (x[0] == 'set!')
        env.find(x[1])[x[1]] = eval(x[2], env);
    else if (x[0] == 'define')
        env[x[1]] = eval(x[2], env);
    else if (x[0] == 'lambda'){
        var vars = x[1];
        var exp = x[2];
        return function(){
            return eval(exp, Env({parms: vars, args: arguments, outer: env}));
        };
    }
    else if (x[0] == 'begin'){
        var val;
        for (var i = 1; i < x.length; i += 1)
            val = eval(x[i], env);
        return val;
    }
    else{
        var exps = [];
        for (i = 0; i < x.length; i += 1)
            exps[i] = eval(x[i], env);
        var proc = exps.shift();
        return proc.apply(env, exps);
    }
}


// parse..................................................................

function parse(s){
	// Read a scheme expression from a string.
	return read_from(tokenize(s));
}

function tokenize(s){
	// Convert a string into list of tokens.
	return s.replace(/\(/g, " ( ").replace(/\)/g, " ) ").trim().split(/\s+/);
}

function read_from(tokens){
	// Read an expression from a sequence of tokens.
    if (tokens.length == 0)
        console.log("Unexpected EOF while reading");
    var token = tokens.shift();
    if ('(' == token){
        var L = [];
        while (')' != tokens[0])
            L.push(read_from(tokens));
        tokens.shift();
        return L;
    }
    else{
        if (')' == token)
            console.log("Unexpected )");
        else
            return atom(token);
    }
}

function atom(token){
    if (isNaN(token))
        return token;
    else
        return parseFloat(token);
}

program = '(* 2 8)'
console.log(eval(parse(program)));

program = '(if (< 10 20) 10 20)'
console.log(eval(parse(program)));

program = '(begin (define r 3) (* 3.14 (* r r)))'
console.log(eval(parse(program)));


