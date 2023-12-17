import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdCategory } from 'src/models/ad.model';
import { AdService } from '../../service/ad.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-ad',
  templateUrl: './create-ad.component.html',
  styleUrls: ['./create-ad.component.scss'],
})
export class CreateAdComponent {

  // Form group to manage the ad creation form
  adForm: FormGroup;

  // Available ad categories
  adCategories: AdCategory[] = Object.values(AdCategory);

  //  initialize form and dependencies
  constructor(
    private formBuilder: FormBuilder,
    private adService: AdService,
    private toastController: ToastController,
    private router: Router
  ) {
    //  creation form with validators
    this.adForm = this.formBuilder.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      picture: [''],
      description: [''],
      location: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      stillAvailable: [true],
    });
  }

  // methods to get form controls
  get name() { return this.adForm.get('name'); }
  get category() { return this.adForm.get('category'); }
  get price() { return this.adForm.get('price'); }
  get location() { return this.adForm.get('location'); }
  get phoneNumber() { return this.adForm.get('phoneNumber'); }
  get description() { return this.adForm.get('description'); }

  // Method to present a toast message
  async presentToast(message: string, color: string, icon: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      cssClass: 'global-toast',
      color,
      buttons: [
        {
          icon,
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  // Method to present a success toast and navigate to the ads list
  async presentSuccessToast() {
    const successMessage = 'Ad created successfully!';
    this.presentToast(successMessage, 'success', 'add-circle');
    this.router.navigate(['/ads/ads-list']);
  }

  // Method to present a failure toast
  async presentFailureToast() {
    const failureMessage = 'Error creating ad. Please try again.';
    this.presentToast(failureMessage, 'danger', 'close-circle');
  }

  // Method called when the ad creation form is submitted
  onSubmit() {
    if (this.adForm.valid) {
      const adData = this.adForm.value;
      console.log(adData);
      // Call the ad service to create the ad
      this.adService.createAd(adData).subscribe(
        (response) => {
          console.log('Ad created successfully:', response);
          this.presentSuccessToast();
        },
        (error) => {
          console.error('Error creating ad:', error);
          this.presentFailureToast();
        }
      );
    } else {
      // Mark all form controls as touched to show validation errors
      Object.keys(this.adForm.controls).forEach(key => {
        this.adForm.get(key)?.markAsTouched();
      });
    }
  }
}
