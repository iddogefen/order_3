
// =========== Functions ===========

// This script includes function we use in the experiment.

// sprintf
if (!String.format) {
    String.format = function(format) {
      var args = Array.prototype.slice.call(arguments, 1);
      return format.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
          ? args[number]
          : match
        ;
      });
    };
  }

  // repmat
  var repmat = function(elem, n){
      // returns an array with element repeated n times.
      var arr = [];
      for (var i = 0; i < n; i++) {
          arr = arr.concat(elem);
      };
      return arr;
  };

  // Range
  function range(start, stop, step) {
  var a = [start], b = start;
  while (b < stop) {
      a.push(b += step || 1);
  }
  return a;
}

// shuffle
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// nis_scanner == "scanner"
function normal(mu, sigma, nsamples){
  if(!nsamples) nsamples = 6
  if(!sigma) sigma = 1
  if(!mu) mu=0

  var run_total = 0
  for(var i=0 ; i<nsamples ; i++){
     run_total += Math.random()
  }

  return sigma*(run_total - nsamples/2)/(nsamples/2) + mu
}

// create all possible combination of pairs
function pairwise(list) {
  if (list.length < 2) { return []; }
  var first = list[0],
      rest  = list.slice(1),
      pairs = rest.map(function (x) { return [first, x]; });
  return pairs.concat(pairwise(rest));
}

// Shift order of rows in a column (for lure items in the memory test)
// and so, instead of an array [[1,2],[3,4],[5,6]] we get [[5,2],[1,4],[3,6]]
function shiftCol(arr, col) {
  var prev = arr[arr.length - 1][col-1];
  arr.forEach(function(v) {
    var t = v[col - 1];
    v[col - 1] = prev;
    prev = t;
  })
  return arr;
}

// Shift order of columns by deciding how many rows we need to move down
function shiftRows(arr, col, n_rows) {
  var original_arr = JSON.parse(JSON.stringify(arr));
  var arr = JSON.parse(JSON.stringify(arr));
  for (i=0; i<arr.length; i++){
    var new_row_ind = i+n_rows;
    if (new_row_ind > arr.length-1){
      new_row_ind = i - arr.length + n_rows;
    }
    arr[i][col] = original_arr[new_row_ind][col]
  }
  return arr;
}

// Swap order of columns according to specific index (for lures in the memory test).
// instead of [[1,2], [3,4], [5,6]] we switch the rows for index 1 for example,
// to get [[1,2], [4,3], [5,6]]
function swap(input, index_A, index_B) {
    var temp = input[index_A];
    input[index_A] = input[index_B];
    input[index_B] = temp;
}

// transpose
function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}

// Save data to file functions
function save_server_data(name, data) {
  var xhr = new XMLHttpRequest();
  //xhr.addEventListener("load", onComplete);
  xhr.open('POST', 'Tools/write_data.php'); // 'write_data.php' is the path to the php file described above.
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    filename: name,
    filedata: data
  }));
}

/*
function save_local_data(name, data){
   var a         = document.createElement('a');
   a.href        = 'data:attachment/csv,' +  encodeURIComponent(data);
   a.target      = '_blank';
   a.download    = name;
   document.body.appendChild(a);
   a.click();
}
*/

function save_local_data(filename, data){
  $.ajax({
    type: 'POST',
    url: 'http://localhost:8000/Tools/write_data_local.php', // Replace this URL with the URL of your PHP script
    data: {
      data: data,
      filename: filename
    },
    success: function(response) {
      console.log(response); // Log the response from the PHP script
    },
    error: function(xhr, status, error) {
      console.error(error); // Log any errors that occur
    }
  });
}


// Time stamp for files
function timeStamp() {
  function s(x) {
    return x.length == 1 ? '0' + x : x
  }
  var a = new Date(),
    MM = s((a.getUTCMonth() + 1).toFixed()),
    dd = s(a.getUTCDate().toFixed()),
    hh = s(a.getUTCHours().toFixed()),
    mm = s(a.getUTCMinutes().toFixed()),
    year = s(a.getFullYear().toFixed());
  return  "d" + MM + dd +  year + "hr" + hh + mm
}

// Generate a random subject ID
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

// Present quiz instructions using a loop function (until they get all qs right)
function present_quiz_instructions(instructions_screen, ttype, quiz_qs, quiz_answers, is_scanner){

    // Make sure participants understood the instructions, by giving them a short quiz.
    // if they got it wrong, present the instructions again, until they get it right.
    var comprehension_check = {
          type: 'survey-multi-choice',
          questions: quiz_qs,
          data: {ttype: ttype},
          on_finish: function(data) {
              var responses = jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0].responses;
                  responses = responses.split(","); // seperate responses by comma
              var correct_answers = quiz_answers;
              var repeat = 0;
              for (i = 0 ; i < correct_answers.length; i++){
                if (!responses[i].includes(correct_answers[i])){
                  repeat = 1;
                } // if
              } // for
              data.repeat_instructions = repeat;
          } // on_finish
        }; // rating_comprehension_check

    var if_missed_instructions = {
      timeline: [missed_instruction_checkup],
      conditional_function: function(data){
          if (jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0].repeat_instructions){
            return true;
          } else {
          return false;
        } // else
      } // conditional function
    } // if_confirmation

    if (is_scanner == "scanner"){
      var show_instructions = {
        timeline: [instructions_screen,comprehension_check]
      }
    } else {
      var show_instructions = {
        timeline: [instructions_screen,comprehension_check,if_missed_instructions],
        loop_function: function(){
          if (jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0].repeat_instructions){
            return true;
          } else {
            return false;
          } // else
        } // loop_function function
      } // repeat_rating_instructions
    }
    return show_instructions
}

// Find trials of block change
function find_block_change(blocks_array){
  var transition_trials = [];
  for (i=0; i<blocks_array.length-1; i++){
    if (blocks_array[i] != blocks_array[i+1]){
      transition_trials = transition_trials.concat(i)
    }
  }
  return transition_trials
}

// sort array of arrays by column
function sortFunction(a, b, column) {
    if (a[column] === b[column]) {
        return 0;
    }
    else {
        return (a[column] < b[column]) ? -1 : 1;
    }
}

// remove item from array
function removeItemOnce(arr, value) {
  var index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

// sum
function sum(input){

  if (toString.call(input) !== "[object Array]")
    return false;
            var total =  0;
            for(var i=0;i<input.length;i++){
                if(isNaN(input[i])){
                continue;}
                  total += Number(input[i]);}
     return total;
}


function response_not_entered(trial, ttype, response_col){

 var enter_response_trial = {
       type: 'html-keyboard-response',
       data: {ttype: "enter_reponse"},
       stimulus: "Please type a response</br></br>"+
                 "Press the "+continue_key_text+" to go back to the last screen",
       choices: keys_decision[0],
       response_ends_trial: true,
       on_finish: function(data){
         data.warning = 1
         data.did_not_enter_response = 1;
       } // on_finish
   } // enter_response_trial

var enter_response_between_range_trial = {
     type: 'html-keyboard-response',
     data: {ttype: "enter_response_between_range"},
     stimulus: "Please enter a value from 0 to 100</br></br>"+
               "Press the "+continue_key_text+" to go back to the last screen",
     choices: keys_decision[0],
     response_ends_trial: true,
     on_finish: function(data){
       data.warning = 1;
     } // on_finish
 } // enter_response_trial

 var if_enter_response = {
     timeline: [enter_response_trial],
     conditional_function: function(data){
         if (isNaN(jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col])){
           return true;
         } else {
         return false;
       } // else
     } // conditional function
   } // if_confirmation

 var if_enter_response_between_range = {
     timeline: [enter_response_between_range_trial],
     conditional_function: function(data){
         if (!isNaN(jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col]) & ((jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col] < 0) | (jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col] > 100))){
           return true;
         } else {
         return false;
       } // else
     } // conditional function
   } // if_confirmation

 var repeat_trial = {
   timeline: [trial, if_enter_response, if_enter_response_between_range],
   loop_function: function(){
     if (isNaN(jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col]) | ((jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col] < 0) | (jsPsych.data.get().filter({ttype: ttype}).last(1).values()[0][response_col] > 100))){
       return true;
     } else {
       return false;
     } // else
   } // loop_function function
 } // repeat_category_familiarity
return repeat_trial
}

// Functions for loading the CSV files that contained optimized jitter durations
function csvJSON(csv) {
   var lines = csv.split('\n');
   lines.pop(); //remove last line
   var result = [];
   var headers = lines[0].split(',');
   for (var i = 1; i < lines.length; i++) {
     var obj = {};
     var currentline = lines[i].split(',');
     for (var j = 0; j < headers.length; j++) {
         curr_header = headers[j].split('"').join('');
         obj[curr_header] = currentline[j].split('"').join('');
       }
     result.push(obj);
   }
   return result;
}

function readTextFile(file, callback) {
     var rawFile = new XMLHttpRequest();
     rawFile.overrideMimeType("application/json");
     rawFile.open("GET", file, false);
     rawFile.onreadystatechange = function() {
         if (rawFile.readyState === 4 && rawFile.status == "200") {
             callback(rawFile.responseText);
         }
     }
     rawFile.send(null);
}
