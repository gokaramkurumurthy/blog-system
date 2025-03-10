import React, { useEffect, useState } from "react";
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Select,
  TextField,
  FormControl,
} from "@mui/material";
import {
  MoreVert,
  CheckCircle,
  PendingActions,
  ArrowUpward,
  ArrowDownward,
  Search,
  HourglassEmpty,
  Cancel,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { Pie, Bar } from "react-chartjs-2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPendingPosts,
  updatePostStatusAPI,
  deletePostAPI,
  fetchPostAnalytics,
} from "../../../APIServices/posts/postsAPI";

import axios, { all } from "axios";
import PostDetailsModal from "./Postdetailmodal";

import "./contentmodsub.css";
// Content Management Component
const ContentPart = () => {
  const [selectedPostinadminpanel, setselectedPostinadminpanel] =
    useState(null);

  const handleOpenModalofposts = (post) => {
    setselectedPostinadminpanel(post);
  };

  const handleCloseModalofposts = () => {
    setselectedPostinadminpanel(null);
  };

  const BackendServername = import.meta.env.VITE_BACKENDSERVERNAME;

  const [allpostsdata, setallpostsdata] = useState([]);

  const [filteredposts, setfilteredposts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${BackendServername}/posts/getallposts`
        );
        console.log(response.data.posts);
        setallpostsdata(response.data.posts);
        setfilteredposts(response.data.posts);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  const [page, setPage] = useState(0);
  const [postsPerPage, setpostsPerPage] = useState(5);
  const totalPages = Math.ceil(filteredposts.length / postsPerPage);

  const handlePrevPage = () => {
    setPage((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };

  const paginatedPosts = filteredposts.slice(
    page * postsPerPage,
    (page + 1) * postsPerPage
  );

  // const [page, setPage] = useState(0);
  // const postsPerPage = 5;
  // const [totalPages, setTotalPages] = useState(1);

  // useEffect(() => {
  //   fetchPosts(0);
  // }, []);

  // const fetchPosts = async (currentPage) => {
  //   try {
  //     const response = await axios.get(
  //       `${BackendServername}/posts/getallposts?page=${currentPage}&limit=${postsPerPage}`
  //     );
  //     setallpostsdata(response.data.posts);
  //     setfilteredposts(response.data.posts);
  //     setTotalPages(Math.ceil(response.data.totalCount / postsPerPage));
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   }
  // };

  // const handlePrevPage = () => {
  //   if (page > 0) {
  //     const newPage = page - 1;
  //     setPage(newPage);
  //     fetchPosts(newPage);
  //   }
  // };

  // const handleNextPage = () => {
  //   if (page < totalPages - 1) {
  //     const newPage = page + 1;
  //     setPage(newPage);
  //     fetchPosts(newPage);
  //   }
  // };

  const [statusFilter, setStatusFilter] = useState("All");

  const handleStatusFilterChange = (event) => {
    const selectedStatus = event.target.value;

    const filteredData =
      selectedStatus === "All"
        ? allpostsdata
        : allpostsdata.filter((e) => e.status === selectedStatus);

    setfilteredposts(filteredData);
    setStatusFilter(selectedStatus);
  };

  const [searchQueryofposts, setSearchQueryofposts] = useState("");

  const handleSearchofposts = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQueryofposts(query);

    if (!query) {
      setfilteredposts(allpostsdata);
      return;
    }

    const filteredResults = allpostsdata.filter((post) =>
      post.author?.username?.toLowerCase().includes(query)
    );

    setfilteredposts(filteredResults);
  };
  const [dateFilter, setDateFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDateFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setDateFilter(selectedFilter);

    if (selectedFilter !== "custom") {
      setStartDate("");
      setEndDate("");
      applyDateFilter(selectedFilter, "", "");
    }
  };

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    if (dateFilter === "custom" && endDate) {
      applyDateFilter("custom", newStartDate, endDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    if (dateFilter === "custom" && startDate) {
      applyDateFilter("custom", startDate, newEndDate);
    }
  };

  const applyDateFilter = (filterType, start, end) => {
    const now = new Date();
    let filteredResults = [];

    switch (filterType) {
      case "today":
        filteredResults = allpostsdata.filter((post) => {
          const postDate = new Date(post.updatedAt);
          return (
            postDate.getDate() === now.getDate() &&
            postDate.getMonth() === now.getMonth() &&
            postDate.getFullYear() === now.getFullYear()
          );
        });
        break;

      case "yesterday":
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        filteredResults = allpostsdata.filter((post) => {
          const postDate = new Date(post.updatedAt);
          return (
            postDate.getDate() === yesterday.getDate() &&
            postDate.getMonth() === yesterday.getMonth() &&
            postDate.getFullYear() === yesterday.getFullYear()
          );
        });
        break;

      case "lastMonth":
        const lastMonth = new Date();
        lastMonth.setMonth(now.getMonth() - 1);
        lastMonth.setDate(1);
        const startOfMonth = new Date(lastMonth);
        lastMonth.setMonth(lastMonth.getMonth() + 1);
        lastMonth.setDate(0);
        const endOfMonth = new Date(lastMonth);

        filteredResults = allpostsdata.filter((post) => {
          const postDate = new Date(post.updatedAt);
          return postDate >= startOfMonth && postDate <= endOfMonth;
        });
        break;

      case "last3Months":
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        filteredResults = allpostsdata.filter((post) => {
          const postDate = new Date(post.updatedAt);
          return postDate >= threeMonthsAgo;
        });
        break;

      case "thisYear":
        const currentYear = now.getFullYear();
        filteredResults = allpostsdata.filter((post) => {
          const postDate = new Date(post.updatedAt);
          return postDate.getFullYear() === currentYear;
        });
        break;

      case "custom":
        if (start && end) {
          const startDateObj = new Date(start);
          const endDateObj = new Date(end);
          endDateObj.setHours(23, 59, 59, 999); // Include full end date

          filteredResults = allpostsdata.filter((post) => {
            const postDate = new Date(post.updatedAt);
            return postDate >= startDateObj && postDate <= endDateObj;
          });
        } else {
          filteredResults = allpostsdata; // Show all posts if no dates selected
        }
        break;

      default:
        filteredResults = allpostsdata;
    }

    setfilteredposts(filteredResults);
  };

  const handleSort = (order) => {
    const sortedData = [...filteredposts].sort((a, b) => {
      return order === "asc"
        ? new Date(a.updatedAt) - new Date(b.updatedAt)
        : new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    setfilteredposts(sortedData);
  };

  const handleStatusChangeofpostsdata = async (id, newStatus) => {
    try {
      await axios.put(`${BackendServername}/posts/updatepoststatus/${id}`, {
        status: newStatus,
      });

      setfilteredposts((prevData) =>
        prevData.map((post) =>
          post._id === id ? { ...post, status: newStatus } : post
        )
      );
    } catch (error) {
      console.error("Error updating post status:", error);
    }
  };

  const queryClient = useQueryClient();
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null); // For three dots menu
  const [selectedPostId, setSelectedPostId] = useState(null); // For delete action

  // Fetch Pending Posts
  const {
    data: postsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["pendingPosts"],
    queryFn: fetchPendingPosts,
  });

  // Fetch Analytics
  const { data: analyticsData = {} } = useQuery({
    queryKey: ["postAnalytics"],
    queryFn: fetchPostAnalytics,
  });

  // Update Post Status
  const updateStatusMutation = useMutation({
    mutationFn: (data) => updatePostStatusAPI(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingPosts"]);
      queryClient.invalidateQueries(["postAnalytics"]);
    },
    onError: (error) => {
      console.error("Error updating post status:", error);
    },
  });

  // Delete Post
  const deleteMutation = useMutation({
    mutationFn: (postId) => deletePostAPI(postId),
    onSuccess: () => {
      queryClient.invalidateQueries(["pendingPosts"]);
      queryClient.invalidateQueries(["postAnalytics"]);
    },
  });

  // Handle Post Status Change
  const handleStatusChange = (id, status) => {
    console.log("Updating post:", id, "to status:", status);
    updateStatusMutation.mutate({ postId: id, status });
  };
  // Handle Delete Post
  const handleDeletePost = (id) => {
    deleteMutation.mutate(id);
    setAnchorEl(null); // Close the menu
  };

  // Handle Three Dots Menu
  const handleMenuOpen = (event, postId) => {
    setAnchorEl(event.currentTarget);
    setSelectedPostId(postId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPostId(null);
  };

  // Handle Modal Open/Close
  const handleOpenModal = (post) => {
    z;
    setSelectedPost(post);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setSelectedPost(null);
    setModalOpen(false);
  };

  if (isLoading) return <p>Loading pending posts...</p>;
  if (isError) return <p>Error loading posts.</p>;

  const posts = postsData?.posts || [];

  // Status Count Data
  const statusCounts = {
    Approved: posts.filter((post) => post.status === "approved").length || 0,
    Pending: posts.filter((post) => post.status === "pending").length || 0,
    Rejected: posts.filter((post) => post.status === "rejected").length || 0,
  };

  // Chart Data
  const chartData = {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Post Status",
        data: [
          statusCounts.Approved,
          statusCounts.Pending,
          statusCounts.Rejected,
        ],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
      },
    ],
  };

  const monthData = {
    labels: ["This Month", "Last Month"],
    datasets: [
      {
        label: "Posts",
        data: [analyticsData.thisMonth || 0, analyticsData.lastMonth || 0],
        backgroundColor: ["#1976d2", "#4caf50"],
      },
    ],
  };

  return (
    <div className="content-management">
      <div
        className="status-cards"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div className="boxdata d-flex justify-content-evenly w-100">
          <Box
            className="cm-data"
            sx={{
              p: 5,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: "#fff",
              textAlign: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
            }}
          >
            <CheckCircle sx={{ fontSize: 50, color: "green" }} />
            <Typography variant="h5">Approved</Typography>
            <Typography style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
              {
                filteredposts.filter(
                  (e) => e.status.toLowerCase() === "approved"
                ).length
              }
            </Typography>
          </Box>

          <Box
            className="cm-data"
            sx={{
              p: 5,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: "#fff",
              textAlign: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
            }}
          >
            <HourglassEmpty sx={{ fontSize: 50, color: "orange" }} />
            <Typography variant="h5">Pending</Typography>
            <Typography style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
              {
                filteredposts.filter(
                  (e) => e.status.toLowerCase() === "pending"
                ).length
              }
            </Typography>
          </Box>

          <Box
            className="cm-data"
            sx={{
              p: 5,
              borderRadius: 2,
              boxShadow: 3,
              backgroundColor: "#fff",
              textAlign: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
            }}
          >
            <Cancel sx={{ fontSize: 50, color: "red" }} />
            <Typography variant="h5">Rejected</Typography>
            <Typography style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
              {
                filteredposts.filter(
                  (e) => e.status.toLowerCase() === "rejected"
                ).length
              }
            </Typography>
          </Box>
        </div>
      </div>
      <Typography
        variant="h6"
        sx={{
          marginTop: 2,
          width: "100%",
          fontWeight: "bold",
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          padding: "15px 0",
          display: "inline-block",
          color: "#007bff",
          fontSize: "1.5rem",
        }}
      >
        Posts data
      </Typography>

      <div className="mt-3 mb-5 d-flex flex-wrap gap-3 align-items-center justify-content-evenly">
        {/* Sorting Icons */}

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          displayEmpty
          sx={{
            minWidth: "200px",
            backgroundColor: "white",
            borderRadius: "8px",
          }}
        >
          <MenuItem value="All">All Posts</MenuItem>
          <MenuItem value="pending">🟠 Pending</MenuItem>
          <MenuItem value="approved">✅ Approved</MenuItem>
          <MenuItem value="rejected">❌ Rejected</MenuItem>
        </Select>

        {/* Search Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            maxWidth: "350px",
            flex: 1,
          }}
        >
          <TextField
            variant="outlined"
            placeholder="Search by username"
            value={searchQueryofposts}
            onChange={handleSearchofposts}
            sx={{
              flex: 1,
              borderRadius: "8px",
              backgroundColor: "#f5f5f5",
              "& fieldset": { borderColor: "#ccc" },
              "&:hover fieldset": { borderColor: "#888" },
              "&.Mui-focused fieldset": { borderColor: "#007bff" },
              "& .MuiInputBase-input": { padding: "10px 14px" },
            }}
          />
          <button className="btn btn-primary px-3">Search</button>
        </Box>

        {/* Date Filter */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#f5f5f5",
            padding: "8px 12px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            flexWrap: "wrap",
          }}
        >
          <Select
            value={dateFilter}
            onChange={handleDateFilterChange}
            displayEmpty
            sx={{
              minWidth: "160px",
              backgroundColor: "white",
              borderRadius: "8px",
              "& .MuiSelect-select": {
                padding: "10px",
              },
            }}
          >
            <MenuItem value="All">📅 All Time</MenuItem>
            <MenuItem value="today">📆 Today</MenuItem>
            <MenuItem value="yesterday">⏳ Yesterday</MenuItem>
            <MenuItem value="lastMonth">📅 Last Month</MenuItem>
            <MenuItem value="last3Months">📅 Last 3 Months</MenuItem>
            <MenuItem value="thisYear">📅 This Year</MenuItem>
            <MenuItem value="custom">📅 Select Date Range</MenuItem>
          </Select>

          {dateFilter === "custom" && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <TextField
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  applyDateFilter("custom", e.target.value, endDate);
                }}
                sx={{
                  minWidth: "150px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#007bff" },
                }}
              />

              <TextField
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  applyDateFilter("custom", startDate, e.target.value);
                }}
                sx={{
                  minWidth: "150px",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "#ccc" },
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#007bff" },
                }}
              />
            </Box>
          )}
        </Box>
      </div>

      <div
        className="d-flex justify-content-between align-items-center gap-3"
        style={{
          padding: "12px 24px",
          borderRadius: "10px",
          backgroundColor: "#fff",
          // boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          marginBottom:"20px"
        }}
      >
        {/* Sorting Buttons */}
        <div className="d-flex align-items-center gap-2">
          <IconButton
            onClick={() => handleSort("asc")}
            title="Sort Ascending"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
            }}
          >
            <ArrowUpward />
          </IconButton>
          <IconButton
            onClick={() => handleSort("desc")}
            title="Sort Descending"
            sx={{
              backgroundColor: "rgba(0, 0, 0, 0.05)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
            }}
          >
            <ArrowDownward />
          </IconButton>
        </div>

        {/* Items per Page Selector */}
        <div className="d-flex align-items-center gap-2">
          <label
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              color: "#444",
              textTransform: "capitalize",
            }}
          >
            Items per page:
          </label>
          <FormControl
            variant="outlined"
            size="small"
            sx={{
              minWidth: 120,
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.12)",
              "&:hover": { boxShadow: "0px 5px 12px rgba(0, 0, 0, 0.15)" },
            }}
          >
            <Select
              value={postsPerPage}
              onChange={(e) => {
                setpostsPerPage(e.target.value);
                setPage(0);
              }}
              displayEmpty
              sx={{
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: "600",
                padding: "6px 12px",
                color: "#333",
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #bbb",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #888",
                },
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
              <MenuItem value={20}>20</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Pagination Controls */}
        <div className="d-flex align-items-center gap-2">
          <IconButton
            onClick={handlePrevPage}
            disabled={page === 0}
            sx={{
              backgroundColor: page === 0 ? "#e0e0e0" : "rgba(0, 0, 0, 0.05)",
              "&:hover": { backgroundColor: page === 0 ? "#e0e0e0" : "#ccc" },
              transition: "0.3s",
            }}
          >
            <ChevronLeft />
          </IconButton>

          <span
            style={{
              fontWeight: "bold",
              fontSize: "1.1rem",
              minWidth: "40px",
              textAlign: "center",
              color: "#333",
            }}
          >
            {page + 1}
          </span>

          <IconButton
            onClick={handleNextPage}
            disabled={page === totalPages - 1}
            sx={{
              backgroundColor:
                page === totalPages - 1 ? "#e0e0e0" : "rgba(0, 0, 0, 0.05)",
              "&:hover": {
                backgroundColor: page === totalPages - 1 ? "#e0e0e0" : "#ccc",
              },
              transition: "0.3s",
            }}
          >
            <ChevronRight />
          </IconButton>
        </div>
      </div>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 3,
          borderRadius: 2,
          overflow: "hidden",
          marginBottom: 4,
        }}
      >
        <Table sx={{ minWidth: 750, textTransform: "capitalize" }}>
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell align="center">
                <b>Sl.no</b>
              </TableCell>
              <TableCell align="center">
                <b>User Name</b>
              </TableCell>
              <TableCell align="center">
                <b>Change Status</b>
              </TableCell>
              <TableCell align="center">
                <b>Current Status</b>
              </TableCell>
              <TableCell align="center">
                <b>Updated At</b>
              </TableCell>
              <TableCell align="center">
                <b>Details</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPosts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  style={{
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    padding: "20px",
                  }}
                >
                  No posts available
                </TableCell>
              </TableRow>
            ) : (
              paginatedPosts.map((item, index) => (
                <TableRow
                  key={index}
                  sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}
                >
                  <TableCell align="center" style={{ fontWeight: "bolder" }}>
                    {page * postsPerPage + index + 1}
                  </TableCell>
                  <TableCell align="center" style={{ fontSize: "1.1rem" }}>
                    {item.author?.username || "Unknown"}
                  </TableCell>
                  <TableCell align="center">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChangeofpostsdata(item._id, e.target.value)
                      }
                      style={{
                        minWidth: "140px",
                        fontWeight: "bold",
                        color:
                          item.status === "pending"
                            ? "orange"
                            : item.status === "approved"
                            ? "green"
                            : "red",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        border: "2px solid #ccc",
                        outline: "none",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <option style={{ color: "orange" }} value="pending">
                        🟠 Pending
                      </option>
                      <option style={{ color: "green" }} value="approved">
                        ✅ Approved
                      </option>
                      <option style={{ color: "red" }} value="rejected">
                        ❌ Rejected
                      </option>
                    </select>
                  </TableCell>
                  <TableCell align="center">
                    <button
                      style={{
                        minWidth: "100px",
                        textTransform: "none",
                        fontWeight: "bold",
                        backgroundColor:
                          item.status === "pending"
                            ? "#ff9800"
                            : item.status === "approved"
                            ? "#4CAF50"
                            : "#F44336",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {item.status.toUpperCase()}
                    </button>
                  </TableCell>
                  <TableCell
                    align="center"
                    style={{ fontSize: "1.1rem", fontWeight: "bolder" }}
                  >
                    {new Date(item.updatedAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell align="center">
                    <button
                      style={{
                        backgroundColor: "#007bff",
                        color: "#ffffff",
                        padding: "10px",
                        border: "1px solid #007bff",
                        cursor: "pointer",
                        borderRadius: "5px",
                      }}
                      onClick={() => handleOpenModalofposts(item)}
                    >
                      Details {"\u27A1"}
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedPostinadminpanel && (
        <PostDetailsModal
          post={selectedPostinadminpanel}
          onHide={handleCloseModalofposts}
          show={true}
        />
      )}
      {/* Post Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>Post Details</DialogTitle>
        <DialogContent>
          {selectedPost && (
            <Box>
              <Box
                component="img"
                src={selectedPost.image}
                alt="Post"
                sx={{ width: "100%", borderRadius: 1 }}
              />
              <Typography variant="body1" sx={{ mt: 2 }}>
                {selectedPost.description}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ContentPart;
