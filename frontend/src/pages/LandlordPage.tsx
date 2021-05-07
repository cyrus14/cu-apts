import { Button, Container, Grid, Hidden, Typography } from '@material-ui/core';
import React, { ReactElement, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewModal from '../components/LeaveReview/ReviewModal';
import PhotoCarousel from '../components/PhotoCarousel/PhotoCarousel';
import InfoFeatures from '../components/Review/InfoFeatures';
import ReviewComponent from '../components/Review/Review';
import ReviewHeader from '../components/Review/ReviewHeader';
import { useTitle } from '../utils';
import LandlordHeader from '../components/Landlord/Header';
import get from '../utils/get';
import styles from './LandlordPage.module.scss';
import { Review, Landlord, ApartmentWithId } from '../../../common/types/db-types';
import Toast from '../components/LeaveReview/Toast';
import AppBar, { NavbarButton } from '../components/utils/NavBar';

export type RatingInfo = {
  feature: string;
  rating: number;
};

const faq: NavbarButton = {
  label: 'FAQ',
  href: '/faq',
};
const review: NavbarButton = {
  label: 'Reviews',
  href: '/landlord/1',
};

const headersData = [faq, review];

const dummyRatingInfo: RatingInfo[] = [
  {
    feature: 'Parking',
    rating: 4.9,
  },
  {
    feature: 'Heating',
    rating: 4.0,
  },
  {
    feature: 'Trash Removal',
    rating: 4.4,
  },
  {
    feature: 'Snow Plowing',
    rating: 3.2,
  },
  {
    feature: 'Maintenance',
    rating: 2.7,
  },
];

const dummyData: Landlord = {
  properties: ['1', '2', '3'],
  photos: [
    'https://lifestylepropertiesithaca.com/gridmedia/img/slide1.jpg',
    'https://images1.apartments.com/i2/F7HtEfdZCVtvQ_DcqGjQuoQ2IcmcMb2nP1PJuOwOdFw/102/carriage-house-apartments-ithaca-ny-primary-photo.jpg',
  ],
  contact: '555-555-5555',
  address: '119 S Cayuga St, Ithaca, NY 14850',
  name: 'Ithaca Live More',
  avgRating: 4,
  reviews: [],
};

const LandlordPage = (): ReactElement => {
  const { landlordId } = useParams<Record<string, string>>();
  const [landlordData] = useState(dummyData);
  const [aveRatingInfo] = useState(dummyRatingInfo);
  const [reviewData, setReviewData] = useState<Review[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [buildings, setBuildings] = useState<ApartmentWithId[]>([]);
  const [properties, setProperties] = useState<string[]>([]);
  const toastTime = 3500;

  useTitle(`Reviews for ${landlordId}`);
  useEffect(() => {
    get<Review>(`/reviews/landlordId/${landlordId}`, setReviewData, undefined);
  }, [landlordId, showConfirmation]);

  useEffect(() => {
    if (landlordData) {
      const propertyIds = landlordData.properties.join();
      get<ApartmentWithId>(`/apts/${propertyIds}`, setBuildings, undefined);
    }
  }, [landlordData]);

  useEffect(() => {
    if (buildings && buildings.length > 0) {
      setProperties(buildings.map((building) => building.name));
    }
  }, [buildings]);

  const showConfirmationToast = () => {
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, toastTime);
  };

  const Modals = (
    <>
      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        setOpen={setReviewOpen}
        landlordId={landlordId}
        onSuccess={showConfirmationToast}
        toastTime={toastTime}
      />
      <PhotoCarousel
        photos={landlordData.photos}
        open={carouselOpen}
        onClose={() => setCarouselOpen(false)}
      />
    </>
  );

  const Header = (
    <>
      <Grid container item spacing={3} justify="space-between" alignItems="center">
        <Grid item>
          <Typography variant="h4">Reviews ({reviewData.length})</Typography>
        </Grid>
        <Button
          color="secondary"
          variant="contained"
          disableElevation
          onClick={() => setCarouselOpen(true)}
        >
          Show all photos
        </Button>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            disableElevation
            onClick={() => setReviewOpen(true)}
          >
            Leave a Review
          </Button>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <ReviewHeader aveRatingInfo={aveRatingInfo} />
      </Grid>
    </>
  );

  const InfoSection = (
    <Grid item xs={12} sm={4}>
      <InfoFeatures {...landlordData} buildings={properties} />
    </Grid>
  );

  return (
    <>
      <Container>
        <AppBar headersData={headersData} />
        <LandlordHeader
          name={landlordData.name}
          overallRating={landlordData.avgRating}
          numReviews={reviewData.length}
          handleClick={() => setCarouselOpen(true)}
        />
      </Container>
      <Container className={styles.OuterContainer}>
        <Grid container spacing={5} justify="center">
          <Grid container spacing={3} item xs={12} sm={8}>
            {Header}
            <Hidden smUp>{InfoSection}</Hidden>
            {showConfirmation && (
              <Toast
                isOpen={showConfirmation}
                severity="success"
                message="Review successfully submitted!"
                time={toastTime}
              />
            )}
            <Grid container item spacing={3}>
              {reviewData.map((review, index) => (
                <Grid item xs={12} key={index}>
                  <ReviewComponent review={review} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Hidden xsDown>{InfoSection}</Hidden>
        </Grid>
      </Container>
      {Modals}
    </>
  );
};

export default LandlordPage;
