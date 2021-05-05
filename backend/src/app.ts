import express, { Express } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import { db } from './firebase-config';
import { Section } from './firebase-config/types';
import {
  Review,
  Landlord,
  Apartment,
  LandlordWithId,
  LandlordWithLabel,
  ApartmentWithLabel,
  ApartmentWithId,
} from '../../common/types/db-types';
import authenticate from './auth';

const app: Express = express();
const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const aptCollection = db.collection('buildings');

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
  })
);
app.use(morgan('combined'));

app.get('/', async (_, res) => {
  const snapshot = await db.collection('faqs').get();

  const faqs: Section[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    const section: Section = {
      headerName: data.headerName,
      faqs: data.faqs,
    };
    faqs.push(section);
  });

  res.status(200).send(JSON.stringify(faqs));
});

app.post('/new-review', authenticate, async (req, res) => {
  try {
    const doc = reviewCollection.doc();
    const review = req.body as Review;
    doc.set({ ...review, date: new Date(review.date) });
    res.status(201).send(doc.id);
  } catch (err) {
    res.status(400).send('Error');
  }
});

app.get('/reviews/:idType/:ids', async (req, res) => {
  const { idType, ids } = req.params;
  const idsList = ids.split(',');
  const reviewsArr = await Promise.all(
    idsList.map(async (id) => {
      const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
      const reviews: Review[] = reviewDocs.map((doc) => {
        const { date, ...data } = doc.data();
        return { date: date.toDate(), ...data } as Review;
      });
      return reviews;
    })
  );

  const allReviews = reviewsArr.length > 1 ? reviewsArr : reviewsArr[0];

  res.status(200).send(JSON.stringify(allReviews));
});

app.get('/apts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await aptCollection.doc(id).get();
    const aptDoc = { id, ...snapshot.data() } as ApartmentWithId;
    res.status(200).send(JSON.stringify(aptDoc));
  } catch (err) {
    res.status(400).send(err);
  }
});

app.post('/landlords', async (req, res) => {
  try {
    const doc = landlordCollection.doc();
    const landlord: Landlord = req.body as Landlord;
    doc.set(landlord);
    res.status(201).send(doc.id);
  } catch (err) {
    res.status(400).send(err);
  }
});

const isLandlord = (obj: LandlordWithId | ApartmentWithId): boolean => 'contact' in obj;

app.get('/reviews', async (req, res) => {
  try {
    const query = req.query.q as string;
    const landlordDocs = (await landlordCollection.get()).docs;
    const landlords: LandlordWithId[] = landlordDocs.map(
      (landlord) => ({ id: landlord.id, ...landlord.data() } as LandlordWithId)
    );
    const aptDocs = (await aptCollection.get()).docs;
    const apts: ApartmentWithId[] = aptDocs.map(
      (apt) => ({ id: apt.id, ...apt.data() } as ApartmentWithId)
    );
    const aptsLandlords: (LandlordWithId | ApartmentWithId)[] = [...landlords, ...apts];

    const options = {
      keys: ['name', 'address'],
    };
    const fuse = new Fuse(aptsLandlords, options);
    const results = fuse.search(query);
    const resultItems = results.map((result) => result.item);

    const resultsWithType: (LandlordWithLabel | ApartmentWithLabel)[] = resultItems.map((result) =>
      isLandlord(result)
        ? ({ label: 'LANDLORD', ...result } as LandlordWithLabel)
        : ({ label: 'APARTMENT', ...result } as ApartmentWithLabel)
    );
    res.status(200).send(JSON.stringify(resultsWithType));
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get('/homepageData', async (req, res) => {
  const buildingDocs = (await aptCollection.limit(3).get()).docs;
  const buildings: Apartment[] = buildingDocs.map((doc) => doc.data() as Apartment);

  const landlords: (LandlordWithId | undefined)[] = await Promise.all(
    // eslint-disable-next-line consistent-return
    buildings.map(async ({ landlordId }) => {
      if (landlordId) {
        // eslint-disable-next-line no-return-await
        const doc = await landlordCollection.doc(landlordId).get();
        const data = doc.data() as Landlord;
        return {
          id: landlordId,
          ...data,
        } as LandlordWithId;
      }
    })
  );

  const data = { buildings, landlords };
  res.status(200).send(JSON.stringify(data));
});

export default app;
