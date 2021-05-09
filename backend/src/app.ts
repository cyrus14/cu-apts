import express, { Express, RequestHandler } from 'express';
import cors from 'cors';
import Fuse from 'fuse.js';
import morgan from 'morgan';
import { db, FieldValue } from './firebase-config';
import { Section } from './firebase-config/types';
import {
  Review,
  Landlord,
  ReviewWithId,
  ReviewInternal,
  Apartment,
  LandlordWithId,
  LandlordWithLabel,
  ApartmentWithLabel,
  ApartmentWithId,
} from '../../common/types/db-types';
import authenticate from './auth';

const reviewCollection = db.collection('reviews');
const landlordCollection = db.collection('landlords');
const aptCollection = db.collection('buildings');
const likesCollection = db.collection('likes');

const app: Express = express();

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
    doc.set({ ...review, date: new Date(review.date), likes: 0 });
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(401).send('Error');
  }
});

app.get('/review/:idType/:id', async (req, res) => {
  const { idType, id } = req.params;
  const reviewDocs = (await reviewCollection.where(`${idType}`, '==', id).get()).docs;
  const reviews: Review[] = reviewDocs.map((doc) => {
    const data = doc.data();
    const review = { ...data, date: data.date.toDate() } as ReviewInternal;
    return { ...review, id: doc.id } as ReviewWithId;
  });
  res.status(200).send(JSON.stringify(reviews));
});

app.get('/reviews/', async (req, res) => {
  type ReqBody = { idType: string; ids: string[] };
  const { idType, ids } = req.body as ReqBody;
  const reviewsArr = await Promise.all(
    ids.map(async (id) => {
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

app.post('/new-landlord', async (req, res) => {
  try {
    const doc = landlordCollection.doc();
    const landlord: Landlord = req.body as Landlord;
    doc.set(landlord);
    res.status(201).send(doc.id);
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
});

const isLandlord = (obj: LandlordWithId | ApartmentWithId): boolean => 'contact' in obj;

app.get('/search', async (req, res) => {
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
    console.error(err);
    res.status(400).send('Error');
  }
});

const likeHandler = (dislike = false): RequestHandler => async (req, res) => {
  try {
    if (!req.user) throw new Error('not authenticated');
    const { uid } = req.user;
    const { reviewId } = req.body;
    if (!reviewId) throw new Error('must specify review id');
    const likesRef = likesCollection.doc(uid);
    const reviewRef = reviewCollection.doc(reviewId);
    await db.runTransaction(async (t) => {
      const likesDoc = await t.get(likesRef);
      const result = likesDoc.get(reviewId);
      if (dislike ? result : !result) {
        const likeEntry = dislike ? FieldValue.delete() : true;
        const likeChange = dislike ? -1 : 1;
        t.set(likesRef, { [reviewId]: likeEntry }, { merge: true });
        t.update(reviewRef, { likes: FieldValue.increment(likeChange) });
      }
    });
    res.status(200).send(JSON.stringify({ result: 'Success' }));
  } catch (err) {
    console.error(err);
    res.status(400).send('Error');
  }
};

app.post('/add-like', authenticate, likeHandler(false));

app.post('/remove-like', authenticate, likeHandler(true));

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
