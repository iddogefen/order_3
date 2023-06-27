function save_local_data(filename, data){
    $.ajax({
      type: 'POST',
      url: 'http://localhost:8000/order_3/Data.php', // Replace this URL with the URL of your PHP script
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