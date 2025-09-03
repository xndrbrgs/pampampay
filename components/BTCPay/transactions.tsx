'use client';

import { useEffect, useState } from 'react';

const Transactions = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/btcpay/transactions");
      const json = await res.json();
      setData(json);
    };
    fetchData();
  }, []);

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  );
};

export default Transactions;