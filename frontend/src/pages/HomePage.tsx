import React, { ReactElement, useState, useEffect } from 'react';
import ApartmentCard from '../components/Home/ApartmentCard';
import { Box, Container, Grid, Typography, Link } from '@material-ui/core';
import Autocomplete from '../components/Home/Autocomplete';
import { Building, LandlordWithId, Review } from '../../../common/types/db-types';
import { Link as RouterLink } from 'react-router-dom';
import get from '../utils/get';

const HomePage = (): ReactElement => {
  const [homeData, setHomedata] = useState<any>([]);
  const [buildingData, setBuildingData] = useState<Building[]>([]);
  const [landlordData, setLandlordData] = useState<LandlordWithId[]>([]);
  const [reviewsBuilding1, setReviewsBuilding1] = useState<Review[]>([]);
  const [reviewsBuilding2, setReviewsBuilding2] = useState<Review[]>([]);
  const [reviewsBuilding3, setReviewsBuilding3] = useState<Review[]>([]);
  const [allReviews, setAllReviews] = useState<Review[][]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    get<any>(`/homepageData`, setHomedata, undefined);
  }, []);

  useEffect(() => {
    setBuildingData(homeData.buildings);
  }, [homeData]);

  useEffect(() => {
    setLandlordData(homeData.landlords);
  }, [homeData]);

  useEffect(() => {
    if (buildingData && buildingData.length > 0) {
      get<Review>(
        `/reviews/landlordId/${buildingData[0].landlordId}`,
        setReviewsBuilding1,
        undefined
      );
    }
  }, [buildingData]);

  useEffect(() => {
    if (buildingData && buildingData.length > 1) {
      get<Review>(
        `/reviews/landlordId/${buildingData[1].landlordId}`,
        setReviewsBuilding2,
        undefined
      );
    }
  }, [buildingData]);

  useEffect(() => {
    if (buildingData && buildingData.length > 2) {
      get<Review>(
        `/reviews/landlordId/${buildingData[2].landlordId}`,
        setReviewsBuilding3,
        undefined
      );
    }
  }, [buildingData]);

  useEffect(() => {
    setAllReviews([reviewsBuilding1, reviewsBuilding2, reviewsBuilding3]);
  }, [reviewsBuilding1, reviewsBuilding2, reviewsBuilding3]);

  useEffect(() => {
    if (buildingData && buildingData.length > 0 && allReviews) {
      setLoaded(true);
    }
  }, [buildingData, allReviews]);

  let idToLandlord: { [id: string]: { company: string; reviews: readonly string[] } } = {};

  landlordData &&
    // eslint-disable-next-line array-callback-return
    landlordData.map(({ id, name, reviews }) => {
      if (!(id in idToLandlord)) {
        idToLandlord[id] = { company: name, reviews };
      }
    });

  return (
    <Box bgcolor="grey.100">
      <Container maxWidth="sm">
        <Box py={6}>
          <Typography variant="h5">
            Search for off-campus housing, review apartments, and share feedback!
          </Typography>
        </Box>
        <Box pb={3} textAlign="center">
          <Typography variant="h4">Browse Renting Companies</Typography>
        </Box>
        <Box pb={5} mx={0}>
          <Autocomplete />
        </Box>
      </Container>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {loaded &&
            buildingData.map(({ name, address, landlordId, numBaths, numBeds, photos }, index) => {
              let company = '';
              let numReviews = 0;
              if (landlordId) {
                company = idToLandlord[landlordId].company;
                numReviews = allReviews[index].length;
              }
              return (
                <Grid item xs={12} md={4}>
                  <Link
                    {...{
                      to: `/landlord/${landlordId}`,
                      style: { textDecoration: 'none' },
                      component: RouterLink,
                    }}
                  >
                    <ApartmentCard
                      key={index}
                      name={name}
                      address={address}
                      company={company}
                      numBaths={numBaths}
                      numBeds={numBeds}
                      numReviews={numReviews}
                      photos={photos}
                    />
                  </Link>
                </Grid>
              );
            })}
        </Grid>
      </Container>
    </Box>
  );
};

export default HomePage;
