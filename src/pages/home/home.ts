import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { CameraPreview, CameraPreviewRect, File, Diagnostic } from 'ionic-native';
declare var cordova: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController, public toastCtrl: ToastController) {
    this.checkPermissions();
  }

  checkPermissions() {
    Diagnostic.isCameraAuthorized().then((authorized) => {
        if(authorized)
            this.initializePreview();
        else {
            Diagnostic.requestCameraAuthorization().then((status) => {
                if(status == Diagnostic.permissionStatus.GRANTED)
                    this.initializePreview();
                else {
                    this.toastCtrl.create(
                        {
                            message: "Cannot access camera", 
                            position: "bottom",
                            duration: 5000
                        }
                    ).present();
                }
            });
        }
    });        
  }

  initializePreview() {
    // Define dimensions of preview window
    let previewRect: CameraPreviewRect = {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Start preview
    CameraPreview.startCamera(
      previewRect, 
      'rear', 
      false, 
      false, 
      true,
      1
    );

    CameraPreview.setOnPictureTakenHandler().subscribe((result) => {
        this.moveFileToExternalStorage(result[0]);        
    });
  }

  moveFileToExternalStorage(fileName: string) {
    let externalStoragePath: string = cordova.file.externalApplicationStorageDirectory;
    let currentPath: string = cordova.file.applicationStorageDirectory + "files/";
    fileName = fileName.split("/").pop();
    File.moveFile(currentPath, fileName, externalStoragePath, fileName).then(_ => {
        this.toastCtrl.create(
            {
                message: "Saved one photo", 
                position: "bottom",
                duration: 2000
            }
        ).present();
    });
  }

  changeEffect() {
    let effects: any = ['none', 'negative','mono', 'aqua', 'sepia'];
    let randomEffect: string = effects[Math.floor(Math.random() * effects.length)];
    CameraPreview.setColorEffect(randomEffect);

    this.toastCtrl.create(
        {
            message: randomEffect.toUpperCase(), 
            position: "bottom",
            duration: 1000
        }
    ).present();
  }

  takePicture() {
    CameraPreview.takePicture({maxWidth: 320, maxHeight: 320});
  }
}
