import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';


const SmartPlaceholder = ({ product, className }) => {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);


    useEffect(() => {
        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (entry) {
                setWidth(entry.contentRect.width);
            }
        });


        if (ref.current) {
            observer.observe(ref.current);
        }


        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);


    const getDisplayText = () => {
        const name = product?.name || "Produk";


        if (width < 60) {
            return name
                .split(' ')
                .slice(0, 2)
                .map(word => word[0])
                .join('')
                .toUpperCase();
        }
        if (width < 120) {
            return name.split(' ')[0];
        }
        return name;
    };
   
    const getFontSizeClass = () => {
        if (width < 60) return 'text-lg';
        if (width < 120) return 'text-sm';
        return 'text-base';
    }


    return (
        <div ref={ref} className={`bg-gray-800 flex items-center justify-center text-center p-2 ${className}`}>
            <span className={`font-bold text-white break-words leading-tight ${getFontSizeClass()}`}>
                {getDisplayText()}
            </span>
        </div>
    );
};


const ProductImage = ({ product, className }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [showPlaceholder, setShowPlaceholder] = useState(false);


    useEffect(() => {
        if (product?.image) {
            setImageSrc(`http://localhost:8000/images/products/${product.image}`);
            setShowPlaceholder(false);
        } else {
            setShowPlaceholder(true);
        }
    }, [product]);


    const handleError = () => {
        setShowPlaceholder(true);
    };


    if (showPlaceholder || !product) {
        return <SmartPlaceholder product={product} className={className} />;
    }


    return (
        <img
            src={imageSrc}
            alt={product.name}
            onError={handleError}
            className={`object-cover ${className}`}
        />
    );
};


SmartPlaceholder.propTypes = {
    product: PropTypes.object,
    className: PropTypes.string,
};
ProductImage.propTypes = {
  product: PropTypes.shape({
    image: PropTypes.string,
    name: PropTypes.string.isRequired,
  }).isRequired,
  className: PropTypes.string,
};
ProductImage.defaultProps = {
  className: '',
};


export default ProductImage;