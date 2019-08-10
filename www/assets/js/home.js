(function () {

    Dropzone.options.myAwesomeDropzone = {
        init: function () {
            this.on('success', function (file) {
                setTimeout(function () {
                    alert('Malware sample uploaded successfully!');
                    location.reload();
                }, 1000);
            });
        }
    };

})();