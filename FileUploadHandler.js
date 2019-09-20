FileUploadHandler.Status = {
    PENDING: 0,
    CANCELED: 1,
    UPLOADING: 2,
    SUCCEEDED: 3,
    FAILED: 4
};
if(Object.freeze !== undefined) {
    Object.freeze(FileUploadHandler.Status);
}

function FileUploadHandler(file, ui) {
    var uploadStatus = FileUploadHandler.Status.PENDING;
    
    this.cancel = function() {
        uploadStatus = FileUploadHandler.Status.CANCELED;
        ui.setProgressLabel("Cancelled!");
        ui.statusChanged(); 
        console.log("cancelled");
          ui.cancel();
        
    }
    

 function successCallback(data, status, xhr) {
        if(data.error !== undefined) {
        console.log("Failed: " + data);
        uploadStatus = FileUploadHandler.Status.FAILED;
        ui.setProgressLabel("Error!");
        ui.setProgressTip(data.error);
        ui.statusChanged();
    } else {
          console.log("Success: " + data);
        uploadStatus = FileUploadHandler.Status.SUCCEEDED;
        ui.setProgressLabel("Completed!");
        ui.statusChanged();
    }
 }
    
    function errorCallback(data, status, xhr) {
        console.log("Failure: " + data);
        uploadStatus = FileUploadHandler.Status.FAILED;
        ui.setProgressLabel("ERROR!");
        ui.setProgressTip(status);
        ui.statusChanged();
    }
    
    function xhrCallback() {
        var xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = function(event) {
            if(event.lengthComputable) {
                var progress = 100 * event.loaded / event.total;
                ui.setProgress(progress);
            }
            console.log(event);
            
        };
        return xhr;
    }
    
    this.upload = function() {
        var fd = new FormData();
        
        fd.append("file", file);
        uploadStatus = FileUploadHandler.Status.UPLOADING;
        ui.setProgressLabel("Uploading...");
        ui.statusChanged();
        ui.upload();
        
        $.ajax({
            type: "POST",
            url:"uploader.php",
            data: fd,
            processData: false,
            contentType: false,
            success: successCallback,
            error: errorCallback,
            xhr: xhrCallback
        });
    }
    
    this.getName = function() {
        return file.name;
    }
    
    this.getStatus = function() {
        return uploadStatus;
    }
    
    function init() {
        var reader = new FileReader();
        
        ui.setHandler(this);
        
        ui.setTitle(
             "Name: " + file.name + "<br>"
             + "Type: " + file.type + "<br>" 
             + "Size: " + file.size
        );
        ui.setProgressLabel("Awaiting Confirmation...");
        ui.statusChanged();
        if(file.type.indexOf("image") > -1) {
            reader.onloadend = function() {
            ui.setImage(reader.result);       
            };
        reader.readAsDataURL(file);
    }else {
        errorCallback("", "<p><b>Not an Image!</b></p><p>This application only handles image uploads.</p>", null);
    }
    }
    init.call(this);
}