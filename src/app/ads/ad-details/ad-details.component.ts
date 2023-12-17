import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdService } from '../../service/ad.service';
import { Ad, AdCategory } from 'src/models/ad.model';
import { SharedService } from '../../service/shared.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-ad-details',
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss'],
})
export class AdDetailsComponent implements OnInit {
  // The ad to display details for
  ad!: Ad;

  // Form group to manage the ad details form
  adForm: FormGroup;

  // Available ad categories
  adCategories: AdCategory[] = Object.values(AdCategory);

  // Constructor to initialize form and dependencies
  constructor(
    private route: ActivatedRoute,
    private adService: AdService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private router: Router
  ) {
    // Define the ad details form with validators
    this.adForm = this.formBuilder.group({
      category: [null, Validators.required],
      name: [null, Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      location: [null, Validators.required],
      phoneNumber: [null, [Validators.required, Validators.pattern('[0-9]{8}')]],
      description: [null],
      stillAvailable: [false],
    });
  }

  //  get form controls
  get name() { return this.adForm.get('name'); }
  get category() { return this.adForm.get('category'); }
  get price() { return this.adForm.get('price'); }
  get location() { return this.adForm.get('location'); }
  get phoneNumber() { return this.adForm.get('phoneNumber'); }
  get description() { return this.adForm.get('description'); }

  ngOnInit() {
    // Subscribe to changes in the selected ad from the shared service
    this.sharedService.getSelectedAd().subscribe((ad) => {
      if (ad) {
        // If an ad is selected, update the ad and the form
        this.ad = ad;
        this.adForm.patchValue(ad);
      } else {
        // If no ad is selected, get the ad ID from the route parameters and load details
        this.route.params.subscribe((params) => {
          const adId = params['id'];
          this.loadAdDetails(adId);
        });
      }
    });
  }

  // Method to load ad details by ID
  loadAdDetails(adId: number) {
    this.adService.getAdById(adId).subscribe((ad) => {
      console.log('fetched Ad details...', ad);
      this.ad = ad;
      this.adForm.patchValue(ad);
    });
  }

  // Method to update the ad details
  updateAd() {
    if (this.adForm.valid) {
      // Combine existing ad with form values to create updated ad
      const updatedAd = { ...this.ad, ...this.adForm.value };
      console.log(updatedAd);
      // Call the ad service to update the ad
      this.adService.updateAd(updatedAd).subscribe(
        (updatedAd) => {
          console.log('Ad updated successfully:', updatedAd);
          this.presentSuccessToast('Ad updated successfully!');
          this.router.navigate(['/ads/ads-list']);
        },
        (error) => {
          console.error('Error updating ad:', error);
          this.presentFailureToast('Error updating ad. Please try again.');
        }
      );
    }
  }

  // Method to present a success toast
  async presentSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      cssClass: 'global-toast',
      color: 'success',
      buttons: [
        {
          icon: 'checkmark-circle',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }

  // Method to present a failure toast
  async presentFailureToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      cssClass: 'global-toast',
      color: 'danger',
      buttons: [
        {
          icon: 'close-circle',
          role: 'cancel',
        },
      ],
    });
    toast.present();
  }
}
