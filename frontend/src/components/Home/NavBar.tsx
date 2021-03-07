import React, { ReactElement, useState, useEffect } from 'react';
import icon from '../../assets/home-icon.png';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.scss';
import { Dropdown } from 'react-bootstrap';
import ReviewModal from '../LeaveReview/ReviewModal';

const NavBar = (): ReactElement => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [toggleMenu, setToggle] = useState(false);
  const clickToggle = (): void => {
    setToggle(!toggleMenu);
  };
  const [width, setWidth] = useState(0);
  const update = (): void => {
    setWidth(window.innerWidth);
    if (width > 600) {
      setToggle(false);
    }
  };

  window.addEventListener('resize', update);
  useEffect(() => {
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayMobileMenu = (): ReactElement => {
    return (
      <Dropdown show={toggleMenu} onToggle={clickToggle}>
        <Dropdown.Toggle>
          <span className={`navbar-toggler-icon ${styles.navbarTogglerIcon}`}></span>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link className="links" to="/faq">
              FAQ
            </Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  };

  const displayNavBar = (): ReactElement => {
    return (
      <ul className="nav nav-button-margin">
        <li>
          <button type="button" className="btn btn-lg btn-outline-dark mr-4">
            <Link to="/faq" className="links">
              FAQ
            </Link>
          </button>
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="btn btn-lg btn-outline-dark"
          >
            <Link to="" className="links">
              Write Review
            </Link>
          </button>
        </li>
      </ul>
    );
  };

  return (
    <div>
      <ReviewModal open={showReviewModal} onClose={() => setShowReviewModal(false)} />
      <nav className={`navbar navbar-light ${styles.navbarExpandLg}`}>
        <a className="navbar-brand" href="/">
          <h1>
            <img className={styles.logo} src={icon} width="40" height="auto" alt="home icon" /> CU
            Housing
          </h1>
        </a>

        {width > 600 ? displayNavBar() : displayMobileMenu()}
      </nav>

      <div className={styles.homepageDescription}>
        <h5>Search for off-campus housing, review apartments, and share feedback!</h5>
      </div>
    </div>
  );
};

export default NavBar;
