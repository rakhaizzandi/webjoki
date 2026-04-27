'use client';

import React, { useState } from 'react';
import { JokiService, JokiServicePackage, AccountFormData } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroBanner from '@/components/ui/HeroBanner';
import AccountForm from '@/components/ui/AccountForm';
import PackageSelector from '@/components/ui/PackageSelector';
import QuantitySelector from '@/components/ui/QuantitySelector';
import ContactDetail from '@/components/ui/ContactDetail';
import ServiceDescription from '@/components/ui/ServiceDescription';
import OrderSidebar from '@/components/ui/OrderSidebar';
import RatingPanel from '@/components/ui/RatingPanel';
import McggCalculator from '@/components/ui/McggCalculator';
import PaymentSelector from '@/components/ui/PaymentSelector';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import ErrorModal from '@/components/ui/ErrorModal';
import styles from './JokiDetailPage.module.css';

interface Props {
  service: JokiService;
}

export default function JokiDetailPage({ service }: Props) {
  const [selectedPackage, setSelectedPackage] = useState<JokiServicePackage | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AccountFormData>({
    email: '',
    password: '',
    loginVia: '',
    nickname: '',
    userId: '',
    serverId: '',
    requestHero: '',
    notes: '',
  });

  const [contactData, setContactData] = useState({
    email: '',
    whatsapp: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitOrder = async () => {
    if (!selectedPackage) {
      setSubmitError('Pilih paket terlebih dahulu.');
      return false;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      setSubmitError('Silakan login terlebih dahulu untuk membuat order.');
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: selectedPackage.serviceId || service.id,
          packageId: selectedPackage.id,
          nickname: formData.nickname,
          userIdML: formData.userId,
          serverId: formData.serverId,
          notes: formData.notes,
          paymentMethod: paymentMethod || 'dana',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setSubmitError(data.error || 'Gagal membuat order.');
        return false;
      }

      return true;
    } catch (error) {
      setSubmitError('Tidak dapat terhubung ke server. Coba lagi nanti.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (data: Partial<AccountFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleContactChange = (data: Partial<{ email: string; whatsapp: string }>) => {
    setContactData((prev) => ({ ...prev, ...data }));
  };

  const handleError = (msg: string, stepId: string) => {
    setErrorMessage(msg);
    document.getElementById(stepId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleOrderSubmit = () => {
    const isGendong = service.category === 'gendong';

    // Validate Step 1 (Account Data)
    const requiredAccountFields = isGendong 
      ? ['userId', 'serverId', 'nickname'] 
      : ['email', 'password', 'loginVia', 'userId', 'serverId', 'nickname'];

    for (const field of requiredAccountFields) {
      if (!formData[field as keyof AccountFormData]) {
        handleError(`Harap lengkapi isian data akun: ${field}`, 'step-1');
        return;
      }
    }

    // Strict Validation: User ID
    if (!/^\d{8,}$/.test(formData.userId)) {
      handleError("User ID tidak valid! Harus berupa angka dan minimal 8 digit.", 'step-1');
      return;
    }

    // Strict Validation: Server ID
    if (!/^\d{4,}$/.test(formData.serverId)) {
      handleError("Server ID tidak valid! Harus berupa angka dan minimal 4 digit.", 'step-1');
      return;
    }

    // Strict Validation: Email (must contain '@')
    if (!isGendong && !formData.email.includes('@')) {
      handleError("Email tidak valid! Harus menyertakan karakter '@'.", 'step-1');
      return;
    }

    // Validate Step 2 (Package)
    if (!selectedPackage) {
      handleError("Harap pilih paket / nominal pesanan terlebih dahulu.", 'step-2');
      return;
    }

    // Validate Step 4 (Payment)
    if (!paymentMethod) {
      handleError("Harap pilih metode pembayaran.", 'step-4');
      return;
    }

    // Validate Step 5 (Contact)
    const waValue = contactData.whatsapp.replace(/\s+/g, '');
    if (!waValue) {
      handleError("Harap isi Nomor WhatsApp atau Detail Kontak.", 'step-5');
      return;
    }

    // Strict Validation: WhatsApp
    if (!/^\+?\d{10,13}$/.test(waValue)) {
      handleError("Nomor WhatsApp/Kontak tidak valid! Harus berupa angka dengan panjang antara 10 hingga 13 digit.", 'step-5');
      return;
    }

    // All valid
    setShowModal(true);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Banner */}
        <HeroBanner service={service} />

        {/* Info Bar */}
        <div className={styles.infoBar}>
          <div className={`container ${styles.infoInner}`}>
            <div className={styles.infoLeft}>
              <h1 className={styles.productName}>{service.title}</h1>
              <span className={styles.brandName}>JOKIMLBB.ID</span>
            </div>
            <div className={styles.infoRight}>
              <div className={styles.badge}>⚡ Proses Cepat</div>
              <div className={styles.badgeDivider}>•</div>
              <div className={styles.badge}>💬 Layanan Chat 24/7</div>
              <div className={styles.badgeDivider}>•</div>
              <div className={styles.badge}>✅ Pembayaran Aman!</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Left content, Right sidebar */}
        <div className={`container ${styles.layoutGrid}`}>
          
          <div className={styles.contentCol}>
            {/* Step 1: Account Data */}
            <div id="step-1">
              <AccountForm data={formData} onChange={handleFormChange} serviceCategory={service.category} />
            </div>

            {/* Step 2: Choose Nominal / Package */}
            <div id="step-2">
              <PackageSelector 
                packages={service.packages} 
                selectedPackage={selectedPackage} 
                onSelect={setSelectedPackage} 
              />
            </div>

            {/* MCGG Calculator (only for Magic Chess) */}
            {service.category === 'magic-chess' && <McggCalculator />}

            {/* Step 3: Quantity */}
            <div id="step-3">
              <QuantitySelector quantity={quantity} onChange={setQuantity} />
            </div>

            {/* Step 4: Pembayaran */}
            <div id="step-4">
              <PaymentSelector 
                selectedPackage={selectedPackage}
                quantity={quantity}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            </div>

            {/* Step 5: Contact Detail */}
            <div id="step-5">
              <ContactDetail data={contactData} onChange={handleContactChange} />
            </div>

            {/* Description / Info */}
            <ServiceDescription serviceTitle={service.title} />
          </div>

          <aside className={styles.sidebarCol}>
            <RatingPanel />
            <OrderSidebar 
              selectedPackage={selectedPackage} 
              quantity={quantity} 
              onOrderClick={handleOrderSubmit}
            />
          </aside>
          
        </div>
      </main>

      {showModal && selectedPackage && (
        <ConfirmationModal
          formData={formData}
          selectedPackage={selectedPackage}
          serviceTitle={service.title}
          paymentMethod={paymentMethod}
          contactWa={contactData.whatsapp}
          onClose={() => {
            setSubmitError(null);
            setShowModal(false);
          }}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onConfirm={async () => {
            return await submitOrder();
          }}
          onSuccessReturn={() => {
            setShowModal(false);
            window.location.href = '/';
          }}
        />
      )}

      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <Footer />
    </>
  );
}
