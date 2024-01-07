const handleRequest = async (req, setLoading, onSuccess, onError) => {
  try {
    setLoading && setLoading(true);

    const { data: res } = await req();

    if (res?.success) {
      onSuccess(res);
    }
  } catch (error) {
    console.log(
      error.response?.data.message || error.message || "Something went wrong"
    );
    onError(
      error.response?.data.message || error.message || "Something went wrong"
    );
  } finally {
    setLoading && setLoading(false);
  }
};

export { handleRequest };
